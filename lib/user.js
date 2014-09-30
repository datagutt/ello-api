var _ = require('lodash');
var Post = require('./Post');
exports = module.exports = User;
function User(user, _ello){
	var self = this;
	self._ello = _ello;
	// For now, just merge the output
	_.merge(this, user);

	// Links should an array divided by ' '
	if(user.links){
		user.links = user.links.split(' ');
	}
	var posts = self.posts;
	if(posts){
		self.posts = _(posts).map(function(post){
			return new Post(post, self);
		}).__wrapped__;
	}
};
