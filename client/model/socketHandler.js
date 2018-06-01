"use strict";
(function() {
    function SocketHandler()
    {
        var self = this;

        self.socketHandler;
    }

    /**
    * Function to create a connection t the socket server
    * The reason writing a function, if the registration fails
    * then an uneccsary connection will be established
    */
    SocketHandler.prototype.connectToServer = function(emailId,username='Ninja User')
    {
        var self = this;

        /**
        * Decide what data need to be sent 
        * while a new connection is established
        * NOTE: the server restart then also a live
        * connection will be established
        */ 
        var details = {
            'emailId':emailId,
            'username':username
        }

        console.log(emailId);

        self.socketHandler = io.connect('http://127.0.0.1:3000/', { query: "details=" + JSON.stringify(details)});

        self.listenToEmits();
    };

    /**
    * Listening to emit form the server
    */
    SocketHandler.prototype.listenToEmits = function()
    {
        var self = this;

        self.socketHandler.on('disconnect',function(){
            window.location.reload();
        });

        self.socketHandler.on('gameCreate', function(game) {
            console.log('New Game created emit');
            window.gameListViewModel.pushNewGame(game);
        });

        self.socketHandler.on('existingRooms', function(games) {
            console.log('Existing rooms emit');
            window.gameListViewModel.populateWithExistingGames(games);
        });

        self.socketHandler.on('joined',function(data){
            console.log('Request to join room approved emit');
            window.gameListViewModel.joinUserToRoom(data.gameObject.gmid,data.userJoined);
        });

        self.socketHandler.on('rejected',function(data){
            console.log('Request to join room rejected emit');
            window.gameListViewModel.rejectUserToRoom(data.gameObject.gmid,data.userJoined);
        });

        self.socketHandler.on('requestJoinRoom',function(data){
            console.log('Request to join room emit');
            window.gameListViewModel.respondToJoinReqeust(data.gmid,data.emailIdToJoin);
        });

        self.socketHandler.on('userDisconnected',function(data){
            console.log('User disconnected emit');
            console.log(data);
        });

        self.socketHandler.on('leave',function(data){
            console.log('User left the room emit');

            if(data.gameObject.gmid && data.emailId)
            window.gameListViewModel.removeUserFromPendingAndRejectedGameList(data.gameObject.gmid,data.emailId);
        });

        self.socketHandler.on('gameDelete',function(game){
            console.log('Game delete emit');
            window.gameListViewModel.removeGame(game);
        });

        self.socketHandler.on('userReadyToPlayGame',function(data){
            console.log('User ready to play game emit');
            var gameObj = window.gamesByIdCollection[data.gameId];

            if(gameObj)
                gameObj.updateUserListReadyToPlay(data.userReadyToPlay,parseInt(data.isReady));
        });

        self.socketHandler.on('gameStarted',function(data){

            console.log('Game started emit');

            var gameObj = window.gamesByIdCollection[data.gameObject.gmid];

            if(gameObj)
                gameObj.setGameStarted(data.userPlaying);
        });

        self.socketHandler.on('score',function(data){
            console.log('New score emit');

            var gameObject = window.gamesByIdCollection[data.gameId];

            if(gameObject)
                gameObject.updateScore(data.score,data.userId,data.pageNum);
        });

        self.socketHandler.on('changePlayer',function(data){
            console.log('Change player emit');

            var gameObject = window.gamesByIdCollection[data.gameId];

            if(gameObject)
                gameObject.changePlayer(data.changedPlayerId,data.pageNum);
        });

        self.socketHandler.on('gameOver',function(data){
            console.log('Game over');

            var gameObject = window.gamesByIdCollection[data.gameId];

            if(gameObject)
                gameObject.finishGameAndDecideResult();
        });

    };

    SocketHandler.prototype.getNumberFromServer = function(userId,gameId)
    {
        var self = this;
        var data = {
            'gameId':gameId,
            'userId':userId
        };

        self.socketHandler.emit('getNumber',data);
    };
    window['socketHandlerInstance'] = new SocketHandler();

})();
