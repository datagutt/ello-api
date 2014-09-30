var _ = require('lodash');
exports = module.exports = Post;
function Post(post, _ello){
	var self = this;
	// For now, just merge the output
	_.merge(self, post);
};
