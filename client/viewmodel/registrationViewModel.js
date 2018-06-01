(function() {
    function registrationViewModel()
    {
        var self = this;

        self.emailId = ko.observable('');

        self.username = ko.observable();

        self.createConnectionToServer = function()
        {
            if (self.emailId().length && validator.isEmail(self.emailId()))
            {
                /**
                 * Create a separate AJAX file which will expose 
                 * GET, POST, PUT, DELETE methods to send
                 * a request to the server
                 */
                $.ajax({
                        method: "PUT",
                        url: "user/register",
                        data: {
                            emailId: self.emailId(),
                            username: self.username()
                        }
                    })
                    .done(function(data) {
                        if (data.status == 'ok') 
                        {
                            window.socketHandlerInstance.connectToServer(self.emailId(), self.username());

                            window.emailId = self.emailId();
                            
                            $('#gameContainer').empty();

                            ko.cleanNode($('#gameContainer')[0]);

                            $('#gameContainer').load('client/html/gameInterface.html', function()
                            {
                                ko.applyBindings(window['gameListViewModel'], $('#gameList')[0]);

                                $('.header').text(`Hi! Welcome ${window.emailId} to Book cricket.`)

                                self.destroy();
                            });
                        } 
                        else 
                        {
                            alert(data.errMsg)
                        }
                    });
            }
            else
            {
                alert('Enter a valid email');
            }
        }
    }


    registrationViewModel.prototype.destroy = function() {
        var self = this;

        for (var i in self) {
            self[i] = null;
        }
    };

    window['registrationViewModel'] = new registrationViewModel();

    ko.cleanNode($('#gameContainer')[0]);

    ko.applyBindings(window['registrationViewModel'], $('#gameContainer')[0]);
})();
