"use strict";

var express = require('express');

var router = express.Router();

var validator = require('validator');

var gamesJs = require('../serverJs/game');

router.put('/create',function(req,res)
{
	var createdBy = req.body.emailId;

	gamesJs.create(createdBy,function(err,gameObject)
	{
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	});
});

router.post('/:id/requestJoin',function(req,res)
{
	var gameId = req.params.id;

	var userToJoin = req.body.emailId;

	gamesJs.requestJoin(gameId,userToJoin,function(err,gameObject)
	{
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	});
});

router.post('/:id/approve',function(req,res)
{
	var gameId = req.params.id;

	var userToJoin = req.body.emailId;

	var userApproving = req.body.approvingByEmailId;

	gamesJs.approveOrRejectUserToGame(gameId,userToJoin,userApproving,1,function(err,gameObject)
	{
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	});
});

router.post('/:id/reject',function(req,res)
{
	var gameId = req.params.id;

	var userToJoin = req.body.emailId;

	var userApproving = req.body.approvingByEmailId;

	gamesJs.approveOrRejectUserToGame(gameId,userToJoin,userApproving,0,function(err,gameObject)
	{
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	});
});

router.post('/:id/readyToPlay',function(req,res)
{
	var gameId = req.params.id;

	var userReadyToPlay= req.body.emailId;

	var isReadyToPlay = parseInt(req.body.isReady);

	gamesJs.updateUserReadyToPlay(gameId,userReadyToPlay,isReadyToPlay,function(err,gameObject){
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	})
});

router.post('/:id/start',function(req,res)
{
	var gameId = req.params.id;

	var userReadyToPlay= req.body.emailId;

	gamesJs.startGame(gameId,userReadyToPlay,function(err,gameObject){
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	})
});

router.post('/:id/quit',function(req,res)
{
	var gameId = req.params.id;

	var userQuiting= req.body.emailId;

	gamesJs.quitGame(gameId,userQuiting,function(err,gameObject){
		if(err)
		{
			return res.json({ status: 'fail', errMsg: err.errMsg});
		}
		else
		{
			return res.json({ status: 'ok', data: gameObject});
		}
	})
});

module.exports = router;