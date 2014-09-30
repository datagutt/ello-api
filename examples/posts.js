var async = require('async');
var Ello = require('../index');
var username = process.env.UN;
var password = process.env.PW;
Ello.login(username, password, function(err, ello){
	ello.getUser('datagutt', function(err, user){
		console.log(user);
	});
});