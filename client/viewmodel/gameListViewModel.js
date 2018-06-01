"use strict";
(function()
{
    function gameListViewModel()
    {
        var self = this;

        self.createNewGameText = ko.observable('Create new game');

        self.emptyGamesList = ko.observable('There are no games available, you can create a new game by clicking on the top.')

        self.gamesList = ko.observableArray([]);

        window.gamesByIdCollection = {};

        self.activeGameInPane = null;

        self.createNewGame = function() 
        {
            $.ajax({
                        method: "PUT",
                        url: "game/create",
                        data: {
                            emailId: window.emailId
                        }
                    })
                    .done(function(data) {
                        if (data.status == 'ok') 
                        {
                            self.pushNewGame(data.data);
                        }
                        else
                        {
                            console.log(data);
                        }
                    });  
        };

        self.pushNewGame = function(game) 
        {
            var gameObj = new Game(game);

            self.gamesList.push(gameObj);

            window.gamesByIdCollection[game.gmid]=gameObj;
        };

        self.populateWithExistingGames = function(existingGamesList) 
        {
            for (var i in existingGamesList) 
            {
                self.pushNewGame(existingGamesList[i]);
            }
        };

        self.removeGame = function(game)
        {
            if(self.gamesList().length)
            {
                self.gamesList().forEach(function(eachGame)
                {
                    if(eachGame.gameId== game.gmid)
                    {
                        self.gamesList.remove(eachGame);

                        delete window.gamesByIdCollection[game.gmid];
                    }
                });
            }

            if(self.gameAreaViewModel && self.gameAreaViewModel.game.gameId == game.gmid)
            {
                alert('The current game was discarded');

                ko.cleanNode($('#gameArea')[0]);

                $('#gameArea').empty();

                self.gameAreaViewModel = null;
            }
        };

        self.respondToJoinReqeust = function(gameId,userToJoin)
        {
            var gameObj = window.gamesByIdCollection[gameId];

            if(gameObj.createdBy() == window.emailId)
            {
                var hasAccepted = confirm(`${userToJoin} wants to join Game no : #${gameObj.seqNo()}`)

                gameObj.respondToJoinReqeust(hasAccepted,userToJoin);
            }
        };

        self.joinUserToRoom = function(gameId,userToJoin)
        {
            var gameObj = window.gamesByIdCollection[gameId];

            gameObj.joinUserToRoom(userToJoin);
        };

        self.rejectUserToRoom = function(gameId,userToJoin)
        {
            var gameObj = window.gamesByIdCollection[gameId];

            gameObj.rejectUserToRoom(userToJoin);
        };

        self.removeUserFromPendingAndRejectedGameList = function(gameId,userLeft)
        {
            var gameObject = window.gamesByIdCollection[gameId];

            gameObject.removeUserFromPendingAndRejectedGame(userLeft);
        };

        self.openGame = function(sender)
        {
            if(!self.gameAreaViewModel)
            {
                if(sender.users().indexOf(window.emailId)>=0)
                {
                    ko.cleanNode($('#gameArea')[0]);

                    $('#gameArea').load('/client/html/gameArea.html',function()
                    {
                        self.gameAreaViewModel = new gameAreaViewModel(sender,window.emailId);

                        sender.isOpenedInGameArea(true);

                        ko.applyBindings(self.gameAreaViewModel,$('#gameArea')[0]);
                    });
                }
                else
                {
                    alert('You dont have access to the game');
                }
            }
            else
            {
                if(sender.users().indexOf(window.emailId)>=0)
                {
                    if(self.gameAreaViewModel.game.gameHasStarted())
                    {
                        self.gameAreaViewModel.game.quitGame();
                    }
                    else if(self.gameAreaViewModel.game.users().indexOf(window.emailId)>=0 && self.gameAreaViewModel.game.userListReadyToPlay[window.emailId])
                    {
                        self.gameAreaViewModel.game.isOpenedInGameArea(false);

                        self.gameAreaViewModel.game.sendRequestToUpdateUserListReadyToPlay(window.emailId,0);
                    }

                    self.gameAreaViewModel = null;

                    ko.cleanNode($('#gameArea')[0]);

                    $('#gameArea').load('/client/html/gameArea.html',function()
                    {
                        self.gameAreaViewModel = new gameAreaViewModel(sender,window.emailId);

                        sender.isOpenedInGameArea(true);

                        ko.applyBindings(self.gameAreaViewModel,$('#gameArea')[0]);
                    });
                }
                else
                {
                    alert('You dont have access to the game');
                }
            }
        };
    };

    window.gameListViewModel = new gameListViewModel()
})();
