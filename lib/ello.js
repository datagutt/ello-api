/* Module dependencies */
var util = require('util');
var inherits = util.inherits;
var EventEmitter = require('events').EventEmitter;
var qs = require('qs');
var superagent = require('superagent');
var _ = require('lodash')
var async = require('async');
var url = require('url');

module.exports = Ello;

var User = require('./user');

Ello.login = function(un, pw, fn){
	if(!fn) fn = function(){};
	var ello = new Ello();
	async.series([
		ello.getAuthenticityToken.bind(ello)
	],
	function(err, token){
		ello.login(un, pw, token, function(err){
			if(err) return fn(err);
			fn.call(ello, null, ello);
		});
	});
	return ello;
}

function Ello(){
	if(!(this instanceof Ello)) return new Ello();
	EventEmitter.call(this);

 	this.agent = superagent.agent();

	this.siteLocation = 'https://ello.co/';
	this.apiLocation = this.siteLocation + 'api/v1/';
}
inherits(Ello, EventEmitter);

Ello.prototype.getAuthenticityToken = function(fn){
	var self = this;
	self.agent
	.get(self.siteLocation + 'enter')
	.end(function(err, res){
		/*
			Never parse HTML like this.
			Seriously.
			It will break.
			This is just a proof of concept.
		*/
		self.agent.saveCookies(res);

		var tokenIndex = res.text.indexOf('csrf-token');
		var token = res.text.slice(tokenIndex-52, tokenIndex-8);
		if(!tokenIndex || !token){
			fn(new Error('Authenticity token not found!'));
		}else{
			fn(null, token);
		}
	});
};
Ello.prototype.login = function(un, pw, token, fn){
	var self = this;
	self.agent
	.post(self.siteLocation + 'enter')
	.type('form')
	.send('user[email]=' + un)
	.send('user[password]=' + pw)
	.send('user[remember_me]=1')
	.send('commit=Enter%20Ello')
	.send('authenticity_token=' + token)
	.send('utf8=✓')
	.end(function(err, res){
		// TODO: detect failed login
		if(res.body.status && res.body.status == 401){
			self.emit('error', new Error('Login failed'));
		}else{
			self.sessionId = res.cookies && res.cookies['_ello_session'];
			self.user = new User(res.body, self);
			self.emit('login');
		}
	});
	self.on('login', fn);
};
Ello.prototype.request = function(method, path, params, data, fn){
	var self = this;
	var defaultParams = {};

	if(self.sessionId){
		res.cookies['_ello_session'] = self.sessionId;
	}

	params = _.merge(defaultParams, params);
	self.agent[method.toLowerCase()](self.apiLocation + path)
	.query(params)
	.send(data)
	.end(fn);
};
Ello.prototype.getUser = function(username, fn){
	var self = this;
	self._mapRequest(self.siteLocation + username + '.json', null, 'user', fn);
};
Ello.prototype._mapRequest = function(url, params, ret, fn){
	var self = this;
	var parse;
	if(ret.indexOf('user') == 0){
		parse = self._parseUser;
	}else if(ret.indexOf('post') == 0){
		parse = self._parsePost;
	}else{
		self.emit('error', new Error('Not implemented'));
	}

	self.request('GET', url, params, null, function(err, res){
		if(parse){
			parse(res.body, fn);
		}else{
			fn(err);
		}
	});
};
Ello.prototype._parseUser = function(item, fn){
	var self = this;
	var user = new User(item, self);
	if(fn){
		fn(null, user);
	}
	return user;
};
Ello.prototype._parsePost = function(item, fn){
	var self = this;
	var post = new Post(item, self);
	if(fn){
		fn(null, post);
	}
	return post;
};