var async = require('async');
var Ello = require('../index');
var username = process.env.UN;
var password = process.env.PW;
Ello.login(username, password, function(err, ello){
	if(err){
		console.log(err);
	}
	ello.getUser('datagutt', function(err, user){
		console.log(user);
	});
	ello.say('howdy', function(err, result){
		console.log(err, result)
	})
});