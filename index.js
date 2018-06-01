var app = require('express')();

var http = require('http').Server(app);

var socketHandler = require('./serverJs/socketHandler');

var bodyParser = require('body-parser');

global.userByEmailCollection = {};

global.gamesByIdCollection = {};

global.socketByEmailIdCollection = {};

global.isTestEnv = false;

socketHandler.createSocketIOServer(http);

http.listen(3000, function() {
    console.log('listening on localhost:3000');
});

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.use(bodyParser.json());

/**
 * Serve the home page
 */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/html/index.html');
});

/**
 * Handle all client related requests
 */
app.use('/client', require('./route/clientRoutes'));

/**
 * Handle all the request related to user route
 */
app.use('/user', require('./route/userRoutes'));

/**
 * Handle all the request related to user route
 */
app.use('/game', require('./route/gameRoutes'));