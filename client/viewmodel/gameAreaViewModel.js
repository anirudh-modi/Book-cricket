"use strict";
function gameAreaViewModel(game,openedBy)
{
	var self = this;

	self.game = game;

	self.openedBy = openedBy;

	self.readyToPlay = function()
	{
		self.game.sendRequestToUpdateUserListReadyToPlay(self.openedBy,1);
	};

	self.startGame = function()
	{
		self.game.sendRequestToStartGame();
	};

	self.getNumber = function()
	{
		self.game.getNumber();
	};

	self.quitGame = function()
	{
		self.game.quitGame();
	};
}