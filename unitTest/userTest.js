"use strict";

var userJs = require('../serverJs/user.js');

var gameJs = require('../serverJs/game.js');

var should = require('should');

GLOBAL.userByEmailCollection = {};

describe('Testing create new user',function()
{
	it('Not sending user detail object',function(done)
	{
		userJs.create(null,function(err)
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@userDetailMissing");
			done();
		})
	});

	it('Sending empty emailId',function(done)
	{
		let userDetail = {
			emailId:''
		};

		userJs.create(userDetail,function(err)
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noEmailToUpdate");
			done();
		})
	});

	it('Sending null as emailId',function(done)
	{
		let userDetail = {
			emailId:null
		};

		userJs.create(userDetail,function(err)
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@noEmailToUpdate");
			done();
		})
	});

	it('Sending number as emailId',function(done)
	{
		let userDetail = {
			emailId:2
		};

		userJs.create(userDetail,function(err)
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@emailNotString");
			done();
		})
	});

	it('Sending invalid emailId',function(done)
	{
		let userDetail = {
			emailId:'ada@asd@as.com'
		};

		userJs.create(userDetail,function(err)
		{
			err.should.have.property('errMsg');
			err.errMsg.should.equal("@invEmailId");
			done();
		})
	});

	it('Sending valid emailId with username',function(done)
	{
		let userDetail = {
			emailId:'ada@as.com',
			username:'Anirudh'
		};

		userJs.create(userDetail,function(err)
		{
			GLOBAL.userByEmailCollection[userDetail.emailId].username.should.equal('Anirudh');
			done();
		});
	});

	it('Sending same emailId with new username, and the latest should have new details',function(done)
	{
		let userDetail = {
			emailId:'ada@as.com',
			username:'Max'
		};

		userJs.create(userDetail,function(err)
		{
			should.not.exist(err);
			GLOBAL.userByEmailCollection[userDetail.emailId].username.should.equal('Max');
			done();
		})
	});
});