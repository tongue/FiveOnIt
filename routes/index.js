
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.client = function(req, res){
	res.render('client', { title: 'Five On It [CLIENT]' });
};