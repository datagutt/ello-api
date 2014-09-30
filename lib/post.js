var _ = require('lodash');
exports = module.exports = Post;
function Post(post, _ello){
	var self = this;
	self._ello = _ello;
	// For now, just merge the output
	_.merge(self, post);
};
