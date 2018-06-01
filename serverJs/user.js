"use strict";
var validator = require('validator');

var socketHandler = require('../serverJs/socketHandler');

var gameJs = require('./game.js');

var async = require('async');

/**
 * While creation of new user,
 * the usr detail object be present
 * email id should be string of valid format
 * if the email id already exists, in the collection,
 * then send a disconnection of previous socket
 * and update with the current detail
 * @param userDetails
 * @param callback
 * @returns {*}
 */
exports.create = function(userDetails, callback)
{
	if(!userDetails)
	{
		return callback({ errMsg: '@userDetailMissing' });
	}

	if (!userDetails.emailId)
	{
		return callback({ errMsg: '@noEmailToUpdate' });
	}

	if(typeof userDetails.emailId !== 'string')
	{
		return callback({ errMsg: '@emailNotString' });
	}

	var emailId = userDetails.emailId.trim();

	var isInvalidRegisteration = invalidRegisteration(emailId);

	if (isInvalidRegisteration)
	{
		return callback({errMsg: isInvalidRegisteration.errMsg});
	}

	if (global.userByEmailCollection && global.userByEmailCollection[emailId] && global.userByEmailCollection[emailId].socketId)
	{
		socketHandler.disconnectSocketById(emailId);

		var username = userDetails.username;

		global.userByEmailCollection[emailId] = {
			'emailId': emailId,
			'username': username,
			'gamesCreated': []
		};

		callback(null);
	}
	else
	{
		async.waterfall(
			[
				function(callback)
				{
					gameJs.removeGamesByUserEmail(emailId,callback);
				},
				function(callback)
				{
					gameJs.removeUserFromPendingAndRejectedGame(emailId,callback);
				},
				function(callback)
				{
					removeUserByEmail(emailId,callback);
				}
			],
			function(err)
			{
				var username = userDetails.username;

				global.userByEmailCollection[emailId] = {
					'emailId': emailId,
					'username': username,
					'gamesCreated': []
				};

				callback(null);
			});
	}
};

exports.getUserByEmail = function(emailId, callback)
{
	if(!emailId)
	{
		return callback({errMsg:'@userIdMissing'});
	}

	if(typeof emailId!='string')
	{
		return callback({errMsg:'@notString'});
	}

	if(!validator.isEmail(emailId))
	{
		return callback({errMsg:'@invEmail'});
	}

	var userObj = global.userByEmailCollection[emailId];

	if(!userObj)
	{
		return callback({errMsg:'@noUserFound'});
	}
	else
	{
		return callback(null,userObj);
	}
};

exports.addGamesCreatedByUser = function(emailId,gameId)
{
	var userObject = global.userByEmailCollection[emailId];

	userObject.gamesCreated.push(gameId);
};

exports.updateUserById = function(emailId,userDetails,callback)
{
	if (!userDetails.emailId)
	{
		return callback({ errMsg: '@noEmailToUpdate' });
	}

	var emailId = userDetails.emailId;

	var username = userDetails.username;

	var userObject = global.userByEmailCollection[emailId];

	if(userObject)
	{
		userObject.username = username;
	}

	callback(null);
};

function removeUserByEmail (emailId,callback)
{
	delete global.userByEmailCollection[emailId];

	callback(null)

}
exports.removeUserByEmail = removeUserByEmail;


/**
 * Check whether a new registration is valid or not
 * TODO: Write Unit test case for this
 */
function invalidRegisteration(emailId)
{
	if (!validator.isEmail(emailId))
	{
		return { errMsg: '@invEmailId' };
	}

	return null;
}