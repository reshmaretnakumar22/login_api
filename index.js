var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var jwt = require('jsonwebtoken');
var config = require('./config');


//db configuration
var connection = mysql.createConnection({
	host     : 'localhost',
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
    const currentTime = new Date();
    console.log(currentTime);
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            console.log(results);
            console.log("ttttttt",fields);
			if (results.length > 0) {
				request.session.loggedin = true;
                request.session.username = username;
                let userCredentials = {
                    'userName' : results[0]['username'],
                    'email':results[0]['email']
                }
                console.log(userCredentials);
                //Create token
                var token = jwt.sign(userCredentials, config.secret, {
                    expiresIn: '2h' // expires in 2 hours
                  }); 
                var decoded = jwt.verify(token,config.secret,function(error,decode){
                    if(error){
                        console.log(error);
                    }else{
                        console.log(decode);
                    }
                })
                console.log(decoded);
                request.session.token = token;
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