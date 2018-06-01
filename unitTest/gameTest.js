"use strict";

var userJs = require('../serverJs/user.js');

var gameJs = require('../serverJs/game.js');

var should = require('should');

var async = require('async');

GLOBAL.userByEmailCollection = {};

GLOBAL.gamesByIdCollection = {};

GLOBAL.socketByEmailIdCollection = {};

GLOBAL.isTestEnv = true;

let gameId1,gameId2,gameId3,gameId4,gameId5;
let userDetail2 = {
	emailId:'anirudh.modi3@gmail.com',
	username:'Anirudh3'
};

let userDetail3 = {
	emailId:'anirudh.modi4@gmail.com',
	username:'Anirudh4'
};

let userDetail = {
	emailId:'anirudh.modi2@gmail.com',
	username:'Anirudh'
};

let userDetail4 = {
	emailId:'anirudh.modi5@gmail.com',
	username:'Anirudh5'
};

describe('Creating a game',function()
{
	it('Fail because the user email was not passed',function(done)
	{
		gameJs.create(null,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@missingEmail");
			done();
		});
	});

	it('Fail because the user email was empty',function(done)
	{
		gameJs.create('',(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@missingEmail");
			done();
		});
	});

	it('Fail because the user email was empty whitespaces',function(done)
	{
		gameJs.create('   ',(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because the user email was number',function(done)
	{
		gameJs.create(2,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@emailNotString");
			done();
		});
	});

	it('Fail because user does not exist',function(done)
	{
		gameJs.create('anirudh.modi2@gmail.com',(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noUserFound");
			done();
		});
	});

	it('Success in creating a game',function(done)
	{
		async.waterfall(
			[
				function(callback)
				{
					userJs.create(userDetail,callback);
				},
				function(callback)
				{
					gameJs.create(userDetail.emailId,callback);
				}
			],
			function(err,gameObject)
			{
				should.not.exist(err);

				let date = new Date();

				gameId1 = `game${date.getFullYear()}${1}`;

				gameObject.should.have.property('gmid');

				gameObject.gmid.should.equal(gameId1);

				GLOBAL.gamesByIdCollection[gameId].should.equal(gameObject);

				gameObject.should.have.property('users');

				var indexOfUser = gameObject.users.indexOf(userDetail.emailId);

				indexOfUser.should.equal(0);

				var index = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId1);

				index.should.equal(0);

				done();
			});
	});

	it('Success in creating another game with same email',function(done)
	{
		let userDetail = {
			emailId:'anirudh.modi2@gmail.com',
			username:'Anirudh'
		};


		gameJs.create(userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			let date = new Date();

			gameId2 = `game${date.getFullYear()}${2}`;

			gameObject.should.have.property('gmid');

			gameObject.gmid.should.equal(gameId2);

			GLOBAL.gamesByIdCollection[gameId].should.equal(gameObject);

			gameObject.should.have.property('users');

			var indexOfUser = gameObject.users.indexOf(userDetail.emailId);

			indexOfUser.should.equal(0);

			var index = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId2);

			index.should.equal(1);

			done();
		});
	});

	it('Success in creating another game with same email',function(done)
	{
		let userDetail = {
			emailId:'anirudh.modi2@gmail.com',
			username:'Anirudh'
		};


		gameJs.create(userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			let date = new Date();

			gameId3 = `game${date.getFullYear()}${3}`;

			gameObject.should.have.property('gmid');

			gameObject.gmid.should.equal(gameId3);

			GLOBAL.gamesByIdCollection[gameId].should.equal(gameObject);

			gameObject.should.have.property('users');

			var indexOfUser = gameObject.users.indexOf(userDetail.emailId);

			indexOfUser.should.equal(0);

			var index = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId3);

			index.should.equal(2);

			done();
		});
	});

	it('Success in creating another game with same email',function(done)
	{
		let userDetail = {
			emailId:'anirudh.modi2@gmail.com',
			username:'Anirudh'
		};


		gameJs.create(userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			let date = new Date();

			gameId4 = `game${date.getFullYear()}${4}`;

			gameObject.should.have.property('gmid');

			gameObject.gmid.should.equal(gameId4);

			GLOBAL.gamesByIdCollection[gameId].should.equal(gameObject);

			gameObject.should.have.property('users');

			var indexOfUser = gameObject.users.indexOf(userDetail.emailId);

			indexOfUser.should.equal(0);

			var index = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId4);

			index.should.equal(3);

			done();
		});
	});

	it('Success in creating another game with same email',function(done)
	{
		let userDetail = {
			emailId:'anirudh.modi2@gmail.com',
			username:'Anirudh'
		};


		gameJs.create(userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			let date = new Date();

			gameId5 = `game${date.getFullYear()}${5}`;

			gameObject.should.have.property('gmid');

			gameObject.gmid.should.equal(gameId5);

			GLOBAL.gamesByIdCollection[gameId].should.equal(gameObject);

			gameObject.should.have.property('users');

			var indexOfUser = gameObject.users.indexOf(userDetail.emailId);

			indexOfUser.should.equal(0);

			var index = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId5);

			index.should.equal(4);

			done();
		});
	});
});

describe('Requesting to join a game',function()
{
	it('Fail because no gameId',(done)=>
	{
		gameJs.requestJoin(null,null,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameIdMissing");
			done();
		});
	});

	it('Fail because gameId which does not exist',(done)=>
	{
		gameJs.requestJoin('game12',null,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noGame");
			done();
		});
	});

	it('Fail because emailId is missing',(done)=>
	{
		gameJs.requestJoin(gameId1,null,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@usrEmailMissing");
			done();
		});
	});

	it('Fail because invalid emailId ',(done)=>
	{
		gameJs.requestJoin(gameId1,2,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because invalid emailId ',(done)=>
	{
		gameJs.requestJoin(gameId1,'asd@ada2@c.mo',err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because the user does not exist',(done) =>
	{
		gameJs.requestJoin(gameId1,'asd@c.com',err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noUser");
			done();
		});
	});

	it('Fail because user1 is already part of the game',(done) =>
	{
		gameJs.requestJoin(gameId1,userDetail.emailId,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@alreadyJoined");
			done();
		});
	});

	it('Success because the user 2 is not part of the game',(done) =>
	{
		async.waterfall(
			[
				function(callback)
				{
					userJs.create(userDetail2,callback);
				},
				function(callback)
				{
					gameJs.requestJoin(gameId1,userDetail2.emailId,callback);
				}
			],
			function(err,gameObject)
			{
				should.not.exist(err);

				GLOBAL.gamesByIdCollection[gameId1].should.equal(gameObject);

				gameObject.should.have.property('pendingUsers');

				var indexOfUser = gameObject.pendingUsers.indexOf(userDetail2.emailId);

				indexOfUser.should.equal(0);

				done();
			});
	});

	it('Success because the user 3 is not part of the game',(done) =>
	{
		async.waterfall(
			[
				function(callback)
				{
					userJs.create(userDetail3,callback);
				},
				function(callback)
				{
					gameJs.requestJoin(gameId1,userDetail3.emailId,callback);
				}
			],
			function(err,gameObject)
			{
				should.not.exist(err);

				GLOBAL.gamesByIdCollection[gameId1].should.equal(gameObject);

				gameObject.should.have.property('pendingUsers');

				var indexOfUser = gameObject.pendingUsers.indexOf(userDetail3.emailId);

				indexOfUser.should.equal(1);

				done();
			});
	});

	it('Fail because user3 has already send the request to join',(done) =>
	{
		gameJs.requestJoin(gameId1,userDetail2.emailId,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@requestAlreadySent");
			done();
		});
	});

	it('Rejecting user3',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail3.emailId,userDetail.emailId,0,function(err,gameObject)
		{
			should.not.exist(err);

			done();
		});
	});

	it('Fail because user3 has already been rejected to join',(done) =>
	{
		gameJs.requestJoin(gameId1,userDetail3.emailId,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@alreadyRejected");
			done();
		});
	});

	it('Success in sending request to join game 3',(done)=>
	{
		gameJs.requestJoin(gameId3,userDetail2.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			GLOBAL.gamesByIdCollection[gameId3].should.equal(gameObject);

			gameObject.should.have.property('pendingUsers');

			var indexOfUser = gameObject.pendingUsers.indexOf(userDetail2.emailId);

			indexOfUser.should.equal(0);

			done();
		});
	});

	it('Accepting user 2 request to join the game',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId3,userDetail2.emailId,userDetail.emailId,1,function(err,gameObject)
		{
			should.not.exist(err);

			done();
		});
	});

	it('Fail because max number people already reached in game 3',(done)=>
	{
		gameJs.requestJoin(gameId3,userDetail3.emailId,err=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@maxLimitReached");
			done();
		});
	});
});

describe('Approving or rejecting a join request',function()
{
	it('Fail because game id was not passed',(done) =>
	{
		gameJs.approveOrRejectUserToGame(null,null,null,1,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameIdMissing");
			done();
		});
	});

	it('Fail because user to be joined is not passed',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,null,null,1,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userIdMissing");
			done();
		});
	});

	it('Fail because user approving is not passed',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail.emailId,null,1,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userIdMissing");
			done();
		});
	});

	it('Fail because user to be joined is number',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,2,userDetail.emailId,1,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@notString");
			done();
		});
	});

	it('Fail because user approving is number',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail.emailId,2,1,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@notString");
			done();
		});
	});

	it('Fail because user to be joined is invalid',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,'asd@ad@cpm',userDetail.emailId,2,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because user approving/reject is invalid',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail.emailId,'asd@ad@cpm',2,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because user approving has not created the game',(done) =>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail2.emailId,userDetail3.emailId,3,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@notAuth");
			done();
		});
	});

	it('Fail because user to be joined not present',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId1,'aniudh@gmail.com',userDetail.emailId,43,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userNtPresent");
			done();
		});
	});

	it('Fail because user3 has not requested to the game',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId2,userDetail3.emailId,userDetail.emailId,43,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userNotRequestedToJoin");
			done();
		});
	});

	it('Fail because the approval value is incorrect ',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail2.emailId,userDetail.emailId,43,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@approvalValueIncorrect");
			done();
		});
	});

	it('Success because the user2 was rejected',(done)=>
	{
		gameJs.approveOrRejectUserToGame(gameId1,userDetail2.emailId,userDetail.emailId,0,(err,gameObject) =>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			var indexOdPending = gameObject.pendingUsers.indexOf(userDetail2.emailId);

			indexOdPending.should.equal(-1);

			var indexOdReject = gameObject.rejectedUsers.indexOf(userDetail2.emailId);

			indexOdReject.should.equal(1);

			var indexOdUser = gameObject.users.indexOf(userDetail2.emailId);

			indexOdUser.should.equal(-1);

			done();
		});
	});

	it('Success in requesting user 4 to join game and approving it',(done)=>
	{
		async.waterfall(
			[
				function(callback)
				{
					userJs.create(userDetail4,(err)=>{
						callback(err);
					});
				},
				function(callback)
				{
					gameJs.requestJoin(gameId1,userDetail4.emailId,(err)=>{
						callback(err);
					})
				},
				function(callback)
				{
					gameJs.approveOrRejectUserToGame(gameId1,userDetail4.emailId,userDetail.emailId,1,(err,gameObject)=>{
						callback(err,gameObject);
					})
				}
			],
			function(err,gameObject)
			{
				should.not.exist(err);

				should.exist(gameObject);

				gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

				var indexOdPending = gameObject.pendingUsers.indexOf(userDetail4.emailId);

				indexOdPending.should.equal(-1);

				var indexOdReject = gameObject.rejectedUsers.indexOf(userDetail4.emailId);

				indexOdReject.should.equal(-1);

				var indexOdUser = gameObject.users.indexOf(userDetail4.emailId);

				indexOdUser.should.equal(1);

				done();
			});
	});
});

describe('Updating ready to play game',function()
{
	it('Fail because game id is missing',(done)=>
	{
		gameJs.updateUserReadyToPlay(null,null,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameIdMissing");
			done();
		});
	});

	it('Fail because game is missing',(done)=>
	{
		gameJs.updateUserReadyToPlay('game123',null,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noGame");
			done();
		});
	});

	it('Fail because user ready to play is missing',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,null,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userIdMissing");
			done();
		});
	});

	it('Fail because user ready to play id is number',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,2,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@notString");
			done();
		});
	});

	it('Fail because user ready to play id is invalid',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,'@sd@sd.com',null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because user ready to play id is not present',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,'sadd@sd.com',null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@usrNtPresent");
			done();
		});
	});

	it('Fail because user ready to play id is not present',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,userDetail2.emailId,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userNotPart");
			done();
		});
	});

	it('Success user is ready to play',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,userDetail4.emailId,1,(err,gameObject)=>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			gameObject.should.have.property('userListReadyToPlay');

			gameObject.userListReadyToPlay.should.have.property(userDetail4.emailId);

			gameObject.userListReadyToPlay[userDetail4.emailId].should.have.property('isReady');

			gameObject.userListReadyToPlay[userDetail4.emailId].isReady.should.equal(1);

			done();
		});
	});

	it('Success user is not ready to play',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,userDetail4.emailId,0,(err,gameObject)=>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			gameObject.should.have.property('userListReadyToPlay');

			should.not.exist(gameObject.userListReadyToPlay[userDetail4.emailId]);

			done();
		});
	});

});

describe('Starting a game',function()
{
	it('Fail because game id was not passed',(done) =>
	{
		gameJs.startGame(null,null,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameIdMissing");
			done();
		});
	});

	it('Fail because game not present',(done) =>
	{
		gameJs.startGame('asdas',null,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noGame");
			done();
		});
	});

	it('Fail because userID not passed',(done)=>
	{
		gameJs.startGame(gameId1,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userIdMissing");
			done();
		});
	});

	it('Fail because userID not string',(done)=>
	{
		gameJs.startGame(gameId1,1,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because userID not passed',(done)=>
	{
		gameJs.startGame(gameId1,'asdS#SD#.com',(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because userID does not exsit',(done)=>
	{
		gameJs.startGame(gameId1,'goku@ki.com',(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userNotPresent");
			done();
		});
	});

	it('Fail because min player has not reached',(done)=>
	{
		gameJs.startGame(gameId4,userDetail.emailId,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@min2playersRequired");
			done();
		});
	});

	it('Fail because all players are not ready to play',(done)=>
	{
		gameJs.startGame(gameId1,userDetail.emailId,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@AllPlayerNotReady");
			done();
		});
	});

	it('Success user 4 is ready to play',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,userDetail4.emailId,1,(err,gameObject)=>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			gameObject.should.have.property('userListReadyToPlay');

			gameObject.userListReadyToPlay.should.have.property(userDetail4.emailId);

			gameObject.userListReadyToPlay[userDetail4.emailId].should.have.property('isReady');

			gameObject.userListReadyToPlay[userDetail4.emailId].isReady.should.equal(1);

			done();
		});
	});

	it('Success user 1 is ready to play',(done)=>
	{
		gameJs.updateUserReadyToPlay(gameId1,userDetail.emailId,1,(err,gameObject)=>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			gameObject.should.have.property('userListReadyToPlay');

			gameObject.userListReadyToPlay.should.have.property(userDetail4.emailId);

			gameObject.userListReadyToPlay[userDetail4.emailId].should.have.property('isReady');

			gameObject.userListReadyToPlay[userDetail4.emailId].isReady.should.equal(1);

			done();
		});
	});

	it('Success to start game',(done)=>
	{
		gameJs.startGame(gameId1,userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			should.exist(gameObject);

			gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId1]);

			gameObject.hasGameStarted.should.equal(true);

			gameObject.userPlayingId.should.equal(userDetail.emailId);

			gameObject.should.have.property('scoresByUserId')

			gameObject.scoresByUserId.should.have.property(userDetail.emailId);

			gameObject.scoresByUserId[userDetail.emailId].should.deepEqual({
				'totalScore':0,
				'numberOfBallsPlayed':0,
				'sumOfAllPages':0,
				'isOut':false,
				'maxBallsReached':false
			});
			done();
		});
	});

	it('Fail because game has already started',(done)=>
	{
		gameJs.startGame(gameId1,userDetail.emailId,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameAlreadyStarted");
			done();
		});
	});
});

describe('Quit Game',function()
{
	it('Fail because game id was not passed',(done) =>
	{
		gameJs.quitGame(null,null,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@gameIdMissing");
			done();
		});
	});

	it('Fail because game not present',(done) =>
	{
		gameJs.quitGame('asdas',null,(err) =>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noGame");
			done();
		});
	});

	it('Fail because userID not passed',(done)=>
	{
		gameJs.quitGame(gameId1,null,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userIdMissing");
			done();
		});
	});

	it('Fail because userID not string',(done)=>
	{
		gameJs.quitGame(gameId1,1,(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because userID not passed',(done)=>
	{
		gameJs.quitGame(gameId1,'asdS#SD#.com',(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmail");
			done();
		});
	});

	it('Fail because userID does not exsit',(done)=>
	{
		gameJs.quitGame(gameId1,'goku@ki.com',(err)=>
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userNotPresent");
			done();
		});
	});

	it('Success because the game has started and user exiting and the game will not exist',(done)=>
	{
		gameJs.quitGame(gameId1,userDetail.emailId,(err,gameObject)=>
		{
			should.not.exist(err);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId1]);

			var indexOfGame = GLOBAL.userByEmailCollection[userDetail.emailId].gamesCreated.indexOf(gameId1)

			indexOfGame.should.equal(-1);

			done();
		});
	});

	it('Success because the user leaving is either pending or rejected to join the game',(done)=>
	{
		async.waterfall(
			[
				function(callback)
				{
					gameJs.requestJoin(gameId2,userDetail2.emailId,(err)=>{
						should.not.exist(err);

						callback(null)
					});
				},
				function(callback)
				{
					gameJs.approveOrRejectUserToGame(gameId2,userDetail2.emailId,userDetail.emailId,0,(err)=>
					{
						should.not.exist(err);

						callback(null)
					});
				},
				function(callback)
				{
					gameJs.quitGame(gameId2,userDetail2.emailId,callback);
				}
			],
			function(err,gameObject)
			{
				should.not.exist(err);

				gameObject.should.deepEqual(GLOBAL.gamesByIdCollection[gameId2]);

				var indexOfGame = GLOBAL.gamesByIdCollection[gameId2].rejectedUsers.indexOf(userDetail2.emailId);

				indexOfGame.should.equal(-1);

				done();
			});
	});
});

describe('Removing games by user"s email',function()
{
	it('Success',(done)=>{
		gameJs.removeGamesByUserEmail(userDetail.emailId,(err)=>
		{
			should.not.exist(err);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId1]);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId2]);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId3]);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId4]);

			should.not.exist(GLOBAL.gamesByIdCollection[gameId5]);

			done();
		});
	});


});