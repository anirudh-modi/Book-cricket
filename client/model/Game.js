"use strict";
function Game(detail)
{
    var self = this;

    self.gameId = detail.gmid;

    self.createdBy = ko.observable(detail.cbe);

    self.createdByText = ko.observable(detail.cbe);

    if(detail.cbe === window.emailId)
    {
        self.createdByText('you')
    }

    self.gameOver = ko.observable(detail.gameOver);

    self.isSelfCreated = ko.observable(detail.cbe === window.emailId);

    self.isActiveInGameArea = ko.observable(false);

    self.users = ko.observableArray(detail.users);

    self.pendingUsers = ko.observableArray(detail.pendingUsers);

    self.rejectedUsers = ko.observableArray(detail.rejectedUsers);

    self.gameHasStarted = ko.observable(detail.hasGameStarted);

    self.canJoinGame = ko.computed(function()
    {
        if(self.rejectedUsers().indexOf(window.emailId)>=0 || self.pendingUsers().indexOf(window.emailId)>=0 || self.users().indexOf(window.emailId)>=0)
        {
            return false;
        }
        else if(self.gameHasStarted() || self.gameOver() || self.users().length==2)
        {
            return false;
        }
        else
        {
            return true;
        }
    });

    self.statusOfGameRequest = ko.computed(function()
    {
        if(self.rejectedUsers().indexOf(window.emailId)>=0)
        {
            return 'Rejected';
        }
        else if(self.pendingUsers().indexOf(window.emailId)>=0)
        {
            return 'Pending';
        }
        else if(self.users().indexOf(window.emailId)>=0)
        {
            return 'Joined';
        }
        else
        {
            return null;
        }
    });

    self.seqNo = ko.observable(detail.seqNo);

    self.userListReadyToPlay = {};

    if(Object.keys(detail.userListReadyToPlay).length)
    {
        self.userListReadyToPlay = detail.userListReadyToPlay
    }

    self.isOpenedInGameArea = ko.observable(false);

    self.showReadyToPlayButton = ko.observable(true);

    self.activitiesList = ko.observableArray([]);

    self.showStartGame = ko.observable(false);

    self.computeStartGame = ko.computed(function(){
        self.canStartGame();
    });

    self.userPlaying = ko.observable();

    self.scoresByUserId = {};
};

Game.prototype.pushToActivity = function(data)
{
  var self  = this;
    self.activitiesList.push({
        text:ko.observable(data.text),
        css:data.css
    });

    $('.activityList').animate({scrollTop: $('.activityList').height()}, 500);
};

Game.prototype.canStartGame = function()
{
    var self = this;

    var canStart = true;

    if(self.users().length && self.users().length>=2)
    {
        for(var i=0;i<self.users().length;i++)
        {
            if(!self.userListReadyToPlay[self.users()[i]])
            {
                canStart = false;

                break;
            }
        }
    }
    else
    {
        canStart = false;
    }

    self.showStartGame(canStart);
};

/**
 * This function is to send a request to server which
 * will notify the creator of the game
 * and based on his approval the user's status
 * to a game acception
 *
 * TODO: DOnt send if the number of user is already max
 * @param userId
 */
Game.prototype.requestToJoinGame = function(userId)
{
    var self = this;

    if(self.rejectedUsers().indexOf(window.emailId)<0 || self.pendingUsers().indexOf(window.emailId)<0 || self.users().indexOf(window.emailId)<0)
    {
        $.ajax({
                method: "POST",
                url: "game/"+self.gameId+"/requestJoin",
                data: {
                    emailId: window.emailId
                }
            })
            .done(function(data) {
                if (data.status == 'ok')
                {
                    self.pendingUsers.push(window.emailId);

                    if(data.data.rejectedUsers.length)
                    {
                        data.data.rejectedUsers.forEach(function(rejectedUser){
                            if(self.rejectedUsers().indexOf(rejectedUser)<0)
                                self.rejectedUsers.push(rejectedUsers);
                        });
                    }

                    self.userListReadyToPlay = data.data.userListReadyToPlay;

                    self.pushToActivity({
                        text:`'${window.emailId}' requested to join the game`,
                        css:''
                    });

                }
                else
                {
                    console.log(data);
                }
            });
    }
    else
    {
        alert('you have already reqesuted');
    }
};

/**
 * This function gets called only to a creator of the
 * game when a new request comes to join a game
 * and the creator has reponded to the request of joining
 * by accept or decline
 * @param hasAccepted
 * @param userToJoin
 */
Game.prototype.respondToJoinReqeust = function(hasAccepted,userToJoin)
{
    var self = this;

    self.pushToActivity({
        text:`'${userToJoin}' requested to join the game.`,
        css:''
    });

    if(hasAccepted)
    {
        $.ajax({
                method: "POST",
                url: "game/"+self.gameId+"/approve",
                data: {
                    'emailId':userToJoin,
                    'approvingByEmailId':window.emailId
                }
            })
            .done(function(data) {
                if (data.status == 'ok')
                {
                    self.joinUserToRoom(userToJoin)
                }
                else
                {
                    console.log(data);
                }
            });
    }
    else
    {
        $.ajax({
                method: "POST",
                url: "game/"+self.gameId+"/reject",
                data: {
                    'emailId':userToJoin,
                    'approvingByEmailId':window.emailId
                }
            })
            .done(function(data) {
                if (data.status == 'ok')
                {
                    self.rejectUserToRoom(userToJoin);
                }
                else
                {
                    console.log(data);
                }
            });
    }
};

/**
 * This function gets called whenever a user is discconected
 * who is either waiting for approval to join the game
 * or who has been rejected to join a game
 * @param userLeft
 */
Game.prototype.removeUserFromPendingAndRejectedGame = function(userLeft)
{
    var self = this;

    var pendingUserListIndex = self.pendingUsers().indexOf(userLeft);

    if(pendingUserListIndex>=0)
    {
        self.pendingUsers.splice(pendingUserListIndex,1);
    }

    var rejectUserListIndex = self.rejectedUsers().indexOf(userLeft);

    if(rejectUserListIndex>=0)
    {
        self.rejectedUsers.splice(rejectUserListIndex,1);
    }
};

Game.prototype.sendRequestToUpdateUserListReadyToPlay = function(userId, isReady)
{
    var self = this;

    $.ajax({
            method: "POST",
            url: "game/"+self.gameId+"/readyToPlay",
            data: {
                'emailId':userId,
                'isReady':isReady
            }
        })
        .done(function(data) {
            if (data.status == 'ok')
            {
                self.updateUserListReadyToPlay(userId, isReady);
            }
            else
            {
                console.log(data);
            }
        });
};

Game.prototype.updateUserListReadyToPlay = function(userId, isReady)
{
    var self = this;

    if(isReady)
    {
        self.userListReadyToPlay[userId] =
        {
            'isReady':isReady
        };

        if(userId===window.emailId)
        {
            self.showReadyToPlayButton(false);
        }

        self.pushToActivity({
            text:`'${userId}' is ready to play the game`,
            css:''
        });
    }
    else
    {
        if(self.userListReadyToPlay[userId])
        {
            delete self.userListReadyToPlay[userId];
        }

        if(userId===window.emailId)
        {
            self.showReadyToPlayButton(true);
        }

        self.pushToActivity({
            text:`'${userId}' is not ready to play the game`,
            css:''
        });
    }

    self.canStartGame();
};

Game.prototype.joinUserToRoom = function(userToJoin)
{
    var self = this;

    self.pendingUsers.splice(self.pendingUsers().indexOf(userToJoin),1);

    self.users.push(userToJoin);

    self.pushToActivity({
        text:`'${self.createdBy()}' approved request of '${userToJoin}' to join the game.`,
        css:''
    });
};

Game.prototype.rejectUserToRoom = function(userToJoin)
{
    var self =  this;

    self.pendingUsers.splice(self.pendingUsers().indexOf(userToJoin),1);

    self.rejectedUsers.push(userToJoin);

    self.pushToActivity({
        text:`'${self.createdBy()}' rejected request of '${userToJoin}' to join the game.`,
        css:''
    });
};

Game.prototype.sendRequestToStartGame = function()
{
    var self = this;

    var canStart = true;

    if(self.users().length && self.users().length>=2)
    {
        for(var i=0;i<self.users().length;i++)
        {
            if(!self.userListReadyToPlay[self.users()[i]])
            {
                canStart = false;

                break;
            }
        }
    }
    else
    {
        canStart = false;
    }

    if(canStart && !self.gameHasStarted())
    {
        $.ajax({
                method: "POST",
                url: "game/"+self.gameId+"/start",
                data: {
                    'emailId':window.emailId
                }
            })
            .done(function(data) {
                if (data.status == 'ok')
                {
                    self.setGameStarted(self.createdBy());
                }
                else
                {
                    console.log(data);
                }
            });
    }
};

Game.prototype.setGameStarted = function(userPlaying)
{
    var self = this;

    self.gameHasStarted(true);

    self.showStartGame(false);

    self.pushToActivity({
        text:`Game has started`,
        css:'gameStarted'
    });

    self.changePlayer(userPlaying);
};

Game.prototype.getNumber = function()
{
    var self = this;

    if(!self.gameOver())
    {
        window.socketHandlerInstance.getNumberFromServer(self.userPlaying(),self.gameId);
    }
};

Game.prototype.updateScore = function(score,userId,pageNum)
{
    var self = this;

    self.scoresByUserId[userId].numberOfBallsPlayed(self.scoresByUserId[userId].numberOfBallsPlayed()+ 1);

    if(score ==0)
    {
        self.scoresByUserId[userId].isOut(true);

        self.pushToActivity({
            text:`${userId} was bowled out at ${self.scoresByUserId[userId].totalScore()}`,
            css:'out'
        });
    }
    else if(score == 5)
    {
        self.scoresByUserId[userId].isOut(true);

        self.pushToActivity({
            text:`${userId} was run out at ${self.scoresByUserId[userId].totalScore()}`,
            css:'out'
        });
    }
    else
    {
        self.scoresByUserId[userId].totalScore(self.scoresByUserId[userId].totalScore() + score);

        self.scoresByUserId[userId].sumOfAllPages(self.scoresByUserId[userId].sumOfAllPages() + pageNum);

        self.pushToActivity({
            text:`${userId} scored ${score} runs`,
            css:'runs'
        });
    }

    if(self.scoresByUserId[userId].numberOfBallsPlayed()%6==0)
    {
        self.pushToActivity({
            text:`Score at End of ${self.scoresByUserId[userId].numberOfBallsPlayed()/6} over ${self.scoresByUserId[userId].totalScore()}`,
            css:'endOfOver'
        });
    }
};

Game.prototype.changePlayer = function(userId)
{
    var self = this;
    self.userPlaying(userId);

    self.scoresByUserId[userId] = {
        'totalScore':ko.observable(0),
        'numberOfBallsPlayed':ko.observable(0),
        'sumOfAllPages':ko.observable(0),
        'isOut':ko.observable(false),
        'emailId':userId
    };

    self.pushToActivity({
        text:`${userId} is playing the innings`,
        css:'endOfInnings'
    });
};

Game.prototype.finishGameAndDecideResult= function()
{
    var self = this;

    self.gameOver(true);

    self.userPlaying(null);

    if(self.users().indexOf(window.emailId)>=0)
    {
        if(self.users().length!==Object.keys(self.scoresByUserId).length)
        {
            self.pushToActivity({text:'Game aborted because player left'});
        }
        else
        {
            var scoresArray=[];

            for(var i in self.scoresByUserId)
            {
                var scoreObject = self.scoresByUserId[i];

                scoresArray.push(scoreObject);
            }

            scoresArray.sort(function(scoreSheet1,scoreSheet2)
            {
                if(scoreSheet1.totalScore()>scoreSheet2.totalScore())
                {
                    return -1
                }
                else if(scoreSheet1.totalScore()<scoreSheet2.totalScore())
                {
                    return 1;
                }
                else
                {
                    if(scoreSheet1.numberOfBallsPlayed()>scoreSheet2.numberOfBallsPlayed())
                    {
                        return 1
                    }
                    else if(scoreSheet1.numberOfBallsPlayed()<scoreSheet2.numberOfBallsPlayed())
                    {
                        return -1;
                    }
                    else
                    {
                        if(!scoreSheet1.isOut() && scoreSheet2.isOut())
                        {
                            return -1;
                        }
                        else if(scoreSheet1.isOut() && !scoreSheet2.isOut())
                        {
                            return 1;
                        }
                        else
                        {
                            if(scoreSheet1.sumOfAllPages()>scoreSheet2.sumOfAllPages())
                            {
                                return -1;
                            }
                            else if(scoreSheet1.sumOfAllPages()<scoreSheet2.sumOfAllPages())
                            {
                                return 1;
                            }
                            else
                            {
                                return 0;
                            }
                        }
                    }
                }
            });

            self.pushToActivity({text:`${scoresArray[0].emailId} has won the match`,css:'hasWonTheMAtch'});
        }

        self.pushToActivity({text:'Game over'});
    }

    setTimeout(function(){
        delete window.gamesByIdCollection[self.gameId];

        if(self.isOpenedInGameArea())
        {
            ko.cleanNode($('#gameArea')[0]);

            $('#gameArea').empty();
        }
    },7000);
};

/***
 * If the game has already started and the user wants to quit
 * then the game needs ot be deleted,
 * else if the user is part of the game and was ready to
 * join the game then just send emit to clear the ready status
 * and if the user was in rejected list then
 */
Game.prototype.quitGame = function()
{
    var self = this;

    if(!self.gameOver())
    {
        $.ajax({
                method: "POST",
                url: "game/"+self.gameId+"/quit",
                data: {
                    'emailId':window.emailId
                }
            })
            .done(function(data) {
                if (data.status == 'ok')
                {
                    //self.updateUserListReadyToPlay(userId, isReady);
                }
                else
                {
                    console.log(data);
                }
            });
    }
};