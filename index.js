var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var jwt = require('jsonwebtoken');
var config = require('./config');



//db configuration
var connection = mysql.createConnection({
	host     : '192.168.15.14',
	user     : 'root',
	password : 'softinc',
	database : 'nodelogin'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	const username = request.body.username;
    const password = request.body.password;
    let userJSON = {};
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            console.log(results);
            console.log("ttttttt",fields);
			if (results.length > 0) {
				request.session.loggedin = true;
                request.session.username = username;
                //Create token
                var token = jwt.sign({ id: results[0].id }, config.secret, {
                    expiresIn: '2h' // expires in 2 hours
                  });
                console.log("token:********",token);
                userJSON['status'] = true;
                userJSON['message'] = "Registration Completed Sucessfully";
                userJSON['data'] = {};
                userJSON['data']['fullName'] = results[0]['username'];
                userJSON['data']['password'] = results[0]['email'];
                userJSON['data']['token'] = token;
                response.send(userJSON);
			} else {
                let sampleJSON = {
                    status:true,
                    message:'Registration completed sucessfully',
                    data:{
                    fullname:'hello',
                    email:'hello@me.com',
                    profile_picture_url:'uploads/profile.png', //if profile pic is not present this field will be null,
                    token:"AMnnk#$0278788498HAjaa"
                    }
                    };
                // response.send('Incorrect Username and/or Password!');
                response.send(sampleJSON);
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);