"use strict";
var userJs = require('./user');

var utilityJs = require('./utility');

var async = require('async');

var socketHandler = require('./socketHandler');

var config = require('../config.json');

var validator = require('validator');

/**
 * Test cases done
 * @param createdByEmail
 * @param callback
 */
exports.create = function(createdByEmail,callback)
{
	var createdBy = '';

	async.waterfall(
		[
			function(callback)
			{

				if(!createdByEmail)
				{
					return callback({ errMsg: '@missingEmail'});
				}

				if(typeof createdByEmail !== 'string')
				{
					return callback({ errMsg: '@emailNotString' });
				}

				if(!validator.isEmail(createdByEmail))
				{
					return callback({ errMsg: '@invEmail'});
				}

				createdBy = createdByEmail.trim();

				callback(null)
			},
			function(callback)
			{
				userJs.getUserByEmail(createdBy,function(err,userObj)
				{
					if(err)
					{
						callback(err);
					}
					else
					{
						callback(null,userObj);
					}
				});
			},
			function(userObj,callback)
			{
				var gameIdAndSeq = utilityJs.generateGameIdAndSeq();

				/**
				 * Creating a games object
				 * this can also hvse other fields like
				 * isPublic to control to whom the game is
				 * visible
				 */
				var gameObject = {
					'cbe':createdBy,
					'gmid':gameIdAndSeq.gmid,
					'ca':new Date(),
					'users':[createdBy],
					'pendingUsers':[],
					'rejectedUsers':[],
					'seqNo':gameIdAndSeq.seq,
					'userListReadyToPlay':{},
					hasGameStarted:false,
					scoresByUserId:{},
					maxScoreToBeat:0,
					gameOver:false
				};

				global.gamesByIdCollection[gameIdAndSeq.gmid] = gameObject;

				/**
				 * Adding to the list of games the user have created
				 */
				userJs.addGamesCreatedByUser(createdBy,gameIdAndSeq.gmid);

				/**
				 * This will make user all the people get an emit
				 * about new game creation.
				 */
				socketHandler.createNewGameRoom(gameObject,userObj.emailId);

				callback(null,gameObject);
			}
		],
		callback);
};

/**
 * Test cases done
 * Whenever a user wants to join a game
 * @param gameId
 * @param userToJoin
 * @param callback
 */
exports.requestJoin = function(gameId,userToJoin,callback)
{
	async.waterfall(
		[
			/**
			 * Checks whether the game is present or not
			 * if the game is present then is the user already a part of the game
			 * or if the request to join the game already exist or not,
			 * ort if the user has already been rejected by the creator
			 * @param callback
			 * @returns {*}
			 */
			function(callback)
			{
				getGameById(gameId,callback)
			},
			/**
			 * Checking if the user who have created and the
			 * user who is about to joined exist or not
			 * @param gameObject
			 * @param callback
			 */
			function(gameObject,callback)
			{
				if(!userToJoin)
				{
					return callback({errMsg:'@usrEmailMissing'});
				}

				if(typeof userToJoin!=='string')
				{
					return callback({errMsg:'@invEmail'});
				}

				if(!validator.isEmail(userToJoin))
				{
					return callback({errMsg:'@invEmail'});
				}

				userJs.getUserByEmail(userToJoin,function(err,userObj)
				{
					if(!userObj)
					{
						callback({errMsg:'@noUser'});
					}
					else
					{
						userJs.getUserByEmail(gameObject.cbe,function(err,userCreatedObj)
						{
							if(err)
							{
								callback({msg:'@noUserCreated'});
							}
							else
							{
								callback(null,gameObject,userObj,userCreatedObj);
							}
						});
					}
				});
			},
			function(gameObject,userToJoinObject,userCreatedObj,callback)
			{
				if(gameObject && gameObject.users.indexOf(userToJoin)>=0)
				{
					return callback({errMsg:'@alreadyJoined'});
				}

				if(gameObject && gameObject.pendingUsers.indexOf(userToJoin)>=0)
				{
					return callback({errMsg:'@requestAlreadySent'});
				}

				if(gameObject && gameObject.rejectedUsers.indexOf(userToJoin)>=0)
				{
					return callback({errMsg:'@alreadyRejected'});
				}

				if(gameObject.users.length===config.maxNumberOfPlayer)
				{
					return callback({errMsg:'@maxLimitReached'});
				}

				callback(null,gameObject,userToJoinObject,userCreatedObj);

			},
			/**
			 * Currently only add in the pending user list
			 * and then send the creator the emit for approval and rejection
			 * @param gameObject
			 * @param userToJoinObject
			 * @param userCreatedObj
			 * @param callback
			 */
			function(gameObject,userToJoinObject,userCreatedObj,callback)
			{
				gameObject.pendingUsers.push(userToJoin);

				socketHandler.requesetToJoinRoom(gameObject,userToJoinObject.emailId,userCreatedObj.emailId);

				callback(null,gameObject);
			}
		],
		callback);
};

/**
 * To remove the games which a user was part
 * Since a user is being removed, then the
 * @param emailId
 * @param callback
 */
exports.removeGamesByUserEmail = function(emailId,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				userJs.getUserByEmail(emailId,callback)
			},
			/**
			 * This part finds all the game of which the user is part of
			 * this can be both games created by the user, or games in which he has
			 * joined(approved by creator only), and the games are then deleted,
			 * as those were an active game, and the corresponding game,
			 * needs to be deleted from the collection
			 * @param userObject
			 * @param callback
			 */
			function(userObject,callback)
			{
				var gamesToBeDeleted = [];

				for(var i in global.gamesByIdCollection)
				{
					var currentGameObject = global.gamesByIdCollection[i];

					if(gamesToBeDeleted.indexOf(currentGameObject.gmid)<0)
					{
						if(currentGameObject.users.indexOf(emailId)>=0)
						{
							gamesToBeDeleted.push(currentGameObject);
						}
					}
				}

				gamesToBeDeleted.forEach(eachGame=>socketHandler.deleteRoom(eachGame));

				gamesToBeDeleted.forEach(eachGame=>
				{
					delete global.gamesByIdCollection[eachGame.gmid]
				});

				callback(null)
			}
		],callback);
};

function getGameById(gameId,callback)
{
	if(!gameId)
	{
		return callback({errMsg:'@gameIdMissing'});
	}

	var gameObject = global.gamesByIdCollection[gameId];

	if(!gameObject)
	{
		callback({errMsg:'@noGame'});
	}
	else
	{
		callback(null,gameObject);
	}
};

exports.getGameById = getGameById;

/**
 * This is to remove a user
 * whos name has been in rejected user list and pending
 * user list of any game
 * @param emailId
 * @param callback
 */
exports.removeUserFromPendingAndRejectedGame = function(emailId,callback)
{
	var gamesToSendLeaveEmit = [];

	for(var i in global.gamesByIdCollection)
	{
		var currentGameObject = global.gamesByIdCollection[i];

		if(gamesToSendLeaveEmit.indexOf(i)<0)
		{
			if(currentGameObject.pendingUsers.indexOf(emailId)>=0)
			{
				currentGameObject.pendingUsers.splice(currentGameObject.pendingUsers.indexOf(emailId),1);
				gamesToSendLeaveEmit.push(currentGameObject);
			}

			if(currentGameObject.rejectedUsers.indexOf(emailId)>=0)
			{
				currentGameObject.rejectedUsers.splice(currentGameObject.rejectedUsers.indexOf(emailId),1);
				gamesToSendLeaveEmit.push(currentGameObject);
			}
		}
	}

	if(gamesToSendLeaveEmit.length)
	{
		socketHandler.leaveRoom(gamesToSendLeaveEmit,emailId);
	}

	if(callback)
	{
		callback(null);
	}
};

/**
 * Test cases done
 * @param gameId
 * @param userToJoin
 * @param userApproving
 * @param isApproved
 * @param callback
 */
exports.approveOrRejectUserToGame = function(gameId,userToJoin,userApproving,isApproved,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				if(!gameId)
				{
					return callback({errMsg:'@gameIdMissing'});
				}

				if(!userToJoin || !userApproving)
				{
					return callback({errMsg:'@userIdMissing'});
				}

				if(typeof userToJoin!=='string' || typeof userApproving !=='string')
				{
					return callback({errMsg:'@notString'});
				}

				if(!validator.isEmail(userApproving) || !validator.isEmail(userToJoin))
				{
					return callback({errMsg:'@invEmail'});
				}

				getGameById(gameId,callback);
			},
			function(gameObject,callback)
			{
				if(userApproving!=gameObject.cbe)
				{
					return callback({errMsg:'@notAuth'});
				}

				userJs.getUserByEmail(userToJoin,(err,userToJoinObject)=>{
					if(err)
					{
						callback({errMsg:'@userNtPresent'});
					}
					else
					{
						userJs.getUserByEmail(gameObject.cbe,function(err,userCreatedObject){
							if(err)
							{
								callback({errMsg:'@notAuth'});
							}
							else
							{
								if(gameObject.pendingUsers.indexOf(userToJoin)<0)
								{
									return callback({errMsg:'@userNotRequestedToJoin'});
								}
								else if(isApproved==1 || isApproved==0)
								{
									callback(null,gameObject,userToJoinObject,userCreatedObject);
								}
								else
								{
									return callback({errMsg:'@approvalValueIncorrect'});
								}
							}
						});
					}
				})
			},
			function(gameObject,userToJoinObject,userCreatedObject,callback)
			{
				gameObject.pendingUsers.splice(gameObject.pendingUsers.indexOf(userToJoin),1);

				if(isApproved)
				{
					gameObject.users.push(userToJoin);

					socketHandler.joinRoom(gameObject,userToJoinObject.emailId,userCreatedObject.emailId);
				}
				else
				{
					gameObject.rejectedUsers.push(userToJoin);

					socketHandler.emitUserRejected(gameObject,userToJoinObject.emailId,userCreatedObject.emailId);
				}

				callback(null,gameObject);
			}

		],
		callback);
};

/**
 * Test Cases done
 * @param gameId
 * @param userId
 * @param isReadyToPlay
 * @param callback
 */
exports.updateUserReadyToPlay = function(gameId,userId,isReadyToPlay,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				getGameById(gameId,callback)
			},
			function(gameObject,callback)
			{
				if(!userId)
				{
					return callback({errMsg:'@userIdMissing'});
				}

				if(typeof userId!=='string')
				{
					return callback({errMsg:'@notString'});
				}

				if(!validator.isEmail(userId))
				{
					return callback({errMsg:'@invEmail'});
				}

				userJs.getUserByEmail(userId,function(err,userObject){
					if(err)
					{
						callback({errMsg:"@usrNtPresent"});
					}
					else
					{
						if(gameObject.users.indexOf(userId)<0)
						{
							return callback({errMsg:'@userNotPart'})
						}
						else
						{
							callback(null,gameObject,userObject);
						}
					}
				});
			},
			function(gameObject,userObject,callback)
			{
				if(isReadyToPlay)
				{
					gameObject.userListReadyToPlay[userId] =
					{
						'isReady':1
					};
				}
				else
				{
					if(gameObject.userListReadyToPlay[userId])
					{
						delete gameObject.userListReadyToPlay[userId];
					}
				}

				socketHandler.sendEmitForUserReadyToPlay(gameObject,userObject.emailId,isReadyToPlay);

				callback(null,gameObject);
			}
		],callback);
};

/**
 * Test cases done
 * @param gameId
 * @param userId
 * @param callback
 */
exports.startGame = function(gameId,userId,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				getGameById(gameId,callback)
			},
			function(gameObject,callback)
			{
				if(!userId)
				{
					return callback({errMsg:'@userIdMissing'});
				}
				if(typeof userId!='string' ||!validator.isEmail(userId))
				{
					return callback({errMsg:'@invEmail'});
				}

				userJs.getUserByEmail(userId,function(err,userObject){
					if(err)
					{
						callback({errMsg:'@userNotPresent'});
					}
					else
					{
						callback(null,gameObject,userObject)
					}
				});
			},
			function(gameObject,userObject,callback)
			{
				if(gameObject.users.indexOf(userId)<0)
				{
					return callback({errMsg:'@usrNotPartOfGame'})
				}
				if(gameObject.hasGameStarted)
				{
					return callback({errMsg:'@gameAlreadyStarted'});
				}

				if(!gameObject.users.length || (gameObject.users.length && gameObject.users.length<config.minPlayerRequired))
				{
					return callback({errMsg:'@min2playersRequired'});
				}

				var canStart = true;
				if(gameObject.users.length)
				{
					for(var i=0;i<gameObject.users.length;i++)
					{
						var usersId = gameObject.users[i];
						if(!gameObject.userListReadyToPlay[usersId])
						{
							canStart=false;
							break;
						}
					}

					if(!canStart)
					{
						return callback({errMsg:'@AllPlayerNotReady'});
					}
				}

				if(!canStart)
				{
					return callback({errMsg:'@AllPlayerNotReady'});
				}
				else
				{
					gameObject.hasGameStarted = true;

					gameObject.userPlayingId = gameObject.cbe;

					gameObject.scoresByUserId[gameObject.cbe] = {
						'totalScore':0,
						'numberOfBallsPlayed':0,
						'sumOfAllPages':0,
						'isOut':false,
						'maxBallsReached':false
					};

					socketHandler.emitGameStarted(gameObject,userObject.emailId,gameObject.cbe);

					callback(null,gameObject);
				}
			}
		],callback);
};

exports.generateScoreByUserId = function(gameId,userId,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				getGameById(gameId,callback)
			},
			function(gameObject,callback)
			{
				if(!userId)
				{
					return callback({errMsg:'@userIdMissing'});
				}

				if(typeof userId!='string' ||!validator.isEmail(userId))
				{
					return callback({errMsg:'@invEmail'});
				}

				userJs.getUserByEmail(userId,function(err,userObject)
				{
					if(err)
					{
						callback({errMsg:'@userNotPresent'});
					}
					else
					{
						callback(null,gameObject);
					}
				});
			},
			function(gameObject,callback)
			{
				if(gameObject.gameOver)
				{
					return callback({errMsg:'@gameOver'});
				}

				var isOut = false, isLastPlayer = false, maxBallReached = false;

				var userHasWon = false;

				if(!gameObject.scoresByUserId[userId].isOut && !gameObject.scoresByUserId[userId].maxBallsReached)
				{
					var randomPageNumber = utilityJs.getRandomWholeNumber();

					var score = utilityJs.calculateScore(randomPageNumber);

					gameObject.scoresByUserId[userId].numberOfBallsPlayed = gameObject.scoresByUserId[userId].numberOfBallsPlayed + 1;

					if(score==0 || score==5)
					{
						gameObject.scoresByUserId[userId].isOut = true;

						isOut = true;
					}
					else
					{
						gameObject.scoresByUserId[userId].totalScore = gameObject.scoresByUserId[userId].totalScore + score;

						gameObject.scoresByUserId[userId].sumOfAllPages = gameObject.scoresByUserId[userId].sumOfAllPages + randomPageNumber;
					}
				}

				if(Object.keys(gameObject.scoresByUserId).length==config.maxNumberOfPlayer)
				{
					isLastPlayer = true;

					if(gameObject.maxScoreToBeat<gameObject.scoresByUserId[userId].totalScore)
					{
						userHasWon = true;
					}
				}

				if(gameObject.scoresByUserId[userId].numberOfBallsPlayed===config.maxNumberOfBalls)
				{
					gameObject.scoresByUserId[userId].maxBallsReached = true;

					maxBallReached = true;
				}

				/**
				 * Once The game is started it can take the following courses
				 * 1. THe player might end up playing the entire innnings, in which case we
				 *    need to trigger a player change event, if the he was not the last player
				 * 2. The player might get out, again this way we need to trigger player çahnge event
				 *    if he is not the last player.
				 * 3. If the user is last player and has won the game, or is out, or has reached the max ball
				 * then send a game over emit
				 */
				if(isLastPlayer && (userHasWon || isOut || maxBallReached))
				{
					gameObject.gameOver=true;

					delete global.gamesByIdCollection[gameId];

					callback(null,gameId,score,userId,randomPageNumber,null,true);
				}
				else if(!isLastPlayer && (isOut || maxBallReached))
				{
					var id;

					if(Object.keys(gameObject.scoresByUserId).length<config.maxNumberOfPlayer)
					{
						for(var i=0;i<gameObject.users.length;i++)
						{
							id = gameObject.users[i];

							if(!gameObject.scoresByUserId[id])
							{
								gameObject.scoresByUserId[id] = {
									'totalScore':0,
									'numberOfBallsPlayed':0,
									'sumOfAllPages':0,
									'isOut':false,
									'maxBallsReached':false
								};
								break;
							}
						}
					}

					if(gameObject.maxScoreToBeat<gameObject.scoresByUserId[userId].totalScore)
					{
						gameObject.maxScoreToBeat=gameObject.scoresByUserId[userId].totalScore;
					}

					callback(null,gameId,score,userId,randomPageNumber,id);
				}
				else
				{
					callback(null,gameId,score,userId,randomPageNumber);
				}
			}
		],callback)
};

/***
 * Test Cases done
 * If the game has already started and the user wants to quit
 * then the game needs ot be deleted,
 * else if the user is part of the game and was ready to
 * join the game then just send emit to clear the ready status
 * and if the user was in rejected list then
 */
exports.quitGame = function(gameId,userQuitingId,callback)
{
	async.waterfall(
		[
			function(callback)
			{
				getGameById(gameId,callback);
			},
			function(gameObject,callback)
			{
				if(!userQuitingId)
				{
					return callback({errMsg:'@userIdMissing'});
				}

				if(typeof userQuitingId!='string' ||!validator.isEmail(userQuitingId))
				{
					return callback({errMsg:'@invEmail'});
				}

				userJs.getUserByEmail(userQuitingId,function(err,userObject)
				{
					if(err)
					{
						callback({errMsg:'@userNotPresent'});
					}
					else
					{
						callback(null,gameObject,userObject);
					}
				});
			},
			function(gameObject,userQuitingObject,callback)
			{
				if(gameObject.hasGameStarted || gameObject.users.indexOf(userQuitingId)>=0)
				{
					socketHandler.deleteRoom(gameObject);

					delete global.gamesByIdCollection[gameId];

					var indexOfGameCreated = global.userByEmailCollection[gameObject.cbe].gamesCreated.indexOf(gameObject.gmid);

					global.userByEmailCollection[gameObject.cbe].gamesCreated.splice(indexOfGameCreated,1);
				}
				else
				{
					if(gameObject.pendingUsers.indexOf(userQuitingId)>=0)
					{
						gameObject.pendingUsers.splice(gameObject.pendingUsers.indexOf(userQuitingId));
					}

					if(gameObject.rejectedUsers.indexOf(userQuitingId)>=0)
					{
						gameObject.rejectedUsers.splice(gameObject.rejectedUsers.indexOf(userQuitingId));
					}

					socketHandler.leaveRoom([gameObject],userQuitingId)
				}

				callback(null,gameObject);
			}
		],callback);
};
