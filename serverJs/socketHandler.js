"use strict";

var socketServer;

var userJs = require('./user');

var gameJs = require('./game');

var async = require('async');

/**
 * A socket connection can be made from app.js
 * and for file segregation
 * @param http
 */
exports.createSocketIOServer = function(http)
{
	socketServer = require('socket.io')(http);

	listenToNewConnections();
};

/**
 * This function listens to "connection" event indicating the
 * a new connection is established from client
 * If there any games present then the new client should watch this
 */
function listenToNewConnections()
{
	socketServer.on('connection',function(socket)
	{
		var details = JSON.parse(socket.handshake.query.details);

		var emailId = details.emailId;

		var username = details.username;

		var userObject = global.userByEmailCollection[emailId];

		/**
		 * If the email is not present with the socket info
		 * then some issue si there, and we need to disconnect the
		 * client
		 */
		if(emailId)
		{
			/**
			 * This is to take care of the scenario below:
			 * CLIENT1 with email E1,sends a request to register
			 * it passes and register itself, but the connection was not made,
			 * it the mean time CLIENT2 with email E1, register, then the previous
			 * user object wil be overriden and the if the socket is conenced
			 * then the socekt object will the CLIENT2, however during retry of
			 * CLIENT1, if it Connects then the socket id in user collection will
			 * be different, indicating an old socket connection and hence disconnect the old
			 */
			if((userObject && !userObject.socketId) || (userObject && userObject.socketId && userObject.socketId===socket.id))
			{
				userObject.socketId = socket.id;

				socket.emailId = emailId;

				if(global.socketByEmailIdCollection[emailId])
				{
					global.socketByEmailIdCollection[emailId].disconnect();

					delete global.socketByEmailIdCollection[emailId];
				}

				global.socketByEmailIdCollection[emailId] = socket;

				console.log(`${emailId} A.K.A "${userObject.username}" with socket id: ${socket.id} has created a new connection.`);

				socket.emit('existingRooms',global.gamesByIdCollection);

				listenToDisconnect(socket);

				listenToEmitFromClient(socket);
			}
			else
			{
				socket.disconnect();
			}
		}
		else
		{
			socket.disconnect();
		}
	});
}

function listenToEmitFromClient(socket)
{
	socket.on('getNumber',function(data){
		gameJs.generateScoreByUserId(data.gameId,data.userId,function(err,gameId,score,userId,randomPageNumber,changedPlayerId,gameOver)
		{
			if(!err)
			{
				var data =
				{
					'score':score,
					'userId':userId,
					'gameId':gameId,
					pageNum:randomPageNumber
				};

				socketServer.to(gameId).emit('score',data);

				if(changedPlayerId)
				{
					data.changedPlayerId = changedPlayerId;

					socketServer.to(gameId).emit('changePlayer',data);
				}

				if(gameOver)
				{
					socketServer.emit('gameOver',data);
				}
			}
		});
	});
}

/**
 * Whenever a socket disconnection is occuring
 * then the user detail need to cleared, other information regarding
 * like games needs to deleted and other user's need to notified about it
 */
function listenToDisconnect(socket)
{
	socket.on('disconnect',function()
	{
		console.log(`socket id: ${socket.id} has disconnected.`);

		if(socket.emailId)
		{
			async.waterfall(
				[
					function(callback)
					{
						gameJs.removeGamesByUserEmail(socket.emailId,callback);
					},
					function(callback)
					{
						gameJs.removeUserFromPendingAndRejectedGame(socket.emailId,callback);
					},
					function(callback)
					{
						userJs.removeUserByEmail(socket.emailId,callback);
					}
				],
				function(err)
				{
					socketServer.emit('userDisconnected',socket.emailId);

					console.log(global.gamesByIdCollection);
				});
		}
	});
}

/***
 * Whenever a new game needs to be created
 * need to join the user who created the game
 * and then send an emit to the all user connected
 */
exports.createNewGameRoom = function(gameObject,createdByEmailId)
{
	if(!global.isTestEnv)
	{
		var createdBySocket = global.socketByEmailIdCollection[createdByEmailId];

		if(createdBySocket)
		{
			createdBySocket.join(gameObject.gmid);

			console.log(`A new game: ${gameObject.gmid} has been created by ${gameObject.cbe}`);

			createdBySocket.broadcast.emit('gameCreate',gameObject);
		}
		else
		{
			console.log(`socket object not found`);
		}
	}
};

/**
 * The entire room is deleted, including the users
 * who are part of this room, also this emit needs to be send ,
 * to everyone as the games list on client needs to be updated
 * @param gameObject
 */
exports.deleteRoom = function(gameObject)
{
	if(!global.isTestEnv)
	{
		console.log(`Game with id: ${gameObject.gmid} has been discarded`);

		if(gameObject)
		{
			gameObject.users.forEach((userId) => {

				var connectedSockets = global.socketByEmailIdCollection[userId];

				if(connectedSockets)
				{
					connectedSockets.leave(gameObject.gmid);

					console.log(`${connectedSockets.emailId} with socket id : ${connectedSockets.id} has left the room`);
				}
			});
		}

		socketServer.emit('gameDelete',gameObject);
	}
};

/**
 * Here only a single user is leaving the room
 * as compared to deleteRoom, where the entire room is deleted
 * @param gameObject
 * @param userLeftEmailId
 */
exports.leaveRoom = function(gameObject,userLeftEmailId)
{
	if(!global.isTestEnv)
	{
		gameObject.forEach((eachGame) => {

			var data = {
				'gameObject':eachGame,
				'emailId':userLeftEmailId
			};

			socketServer.to(eachGame.gmid).emit('leave',data);

			console.log(`Sending emit to user of game id:${eachGame.gmid} for user's ${userLeftEmailId} disconnection.`);
		});
	}
};

exports.requesetToJoinRoom = function(gameObject,userToJoinEmail,userCreatedEmail)
{
	var connectedSockets = global.socketByEmailIdCollection[userCreatedEmail];

	var data = {
		'gmid':gameObject.gmid,
		'emailIdToJoin':userToJoinEmail
	};

	if(connectedSockets)
	{
		connectedSockets.emit('requestJoinRoom',data);
	}
};

/**
 * here both the user who is to be joined and the user created the game
 * socket id is required, since, the user who is to be joined to the room
 * and socket emit to other member of the room are to be made through the socket
 * object of the user who created the game
 * @param gameObject
 * @param userToJoinSocketId
 */
exports.joinRoom = function(gameObject,userToJoinEmailId,userCreatedEmailId)
{
	if(!global.isTestEnv)
	{
		var userToJoinSocket = global.socketByEmailIdCollection[userToJoinEmailId];

		var userCreatedSocket = global.socketByEmailIdCollection[userCreatedEmailId];

		if(userToJoinSocket)
		{
			userToJoinSocket.join(gameObject.gmid);
		}

		var data = {
			'userJoined':userToJoinSocket.emailId,
			'gameObject':gameObject
		};

		if(userCreatedSocket)
		{
			userCreatedSocket.broadcast.emit('joined',data);
		}
	}
};

/**
 * Here it is important to have both the user who created the
 * game's socket id and the user who is being rejected, because for
 * him the user is not joined to room the and reject event will not
 * be emitted, so, to the user who is rejected we need to make a specififc
 * emit
 */
exports.emitUserRejected = function(gameObject,userToJoinEmailId,userCreatedEmailId)
{
	if(!global.isTestEnv)
	{
		var userCreatedSocket = global.socketByEmailIdCollection[userCreatedEmailId];

		var userToJoinSocket = global.socketByEmailIdCollection[userToJoinEmailId];

		var data = {
			'userJoined':userToJoinSocket.emailId,
			'gameObject':gameObject
		};

		if(userToJoinSocket)
		{
			userToJoinSocket.emit('rejected',data);
		}


		if(userCreatedSocket)
		{
			userCreatedSocket.to(gameObject.gmid).emit('rejected',data);
		}
	}
};

exports.sendEmitForUserReadyToPlay = function(gameObject,userReadyEmailId,isReady)
{
	if(!global.isTestEnv)
	{
		var userReadySocket = global.socketByEmailIdCollection[userReadyEmailId];

		if(userReadySocket)
		{
			var data =
			{
				'gameId':gameObject.gmid,
				isReady:isReady,
				userReadyToPlay:userReadySocket.emailId
			};

			userReadySocket.to(data.gameId).emit('userReadyToPlayGame',data);
		}
	}
};

exports.emitGameStarted = function(gameObject,emailId,userPlayingId)
{
	var userReadySocket = global.socketByEmailIdCollection[emailId];

	if(userReadySocket)
	{
		var data = {
			gameObject:gameObject,
			userPlaying:userPlayingId
		};

		userReadySocket.to(gameObject.gmid).emit('gameStarted',data);
	}
};

exports.disconnectSocketById = function(emailId)
{
	var userReadySocket = global.socketByEmailIdCollection[emailId];
	if(userReadySocket)
		userReadySocket.disconnect();
};
