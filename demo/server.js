#!/usr/bin/env node
/**
* Extremely simple static website serving script
* This is provided in case you need to deploy a quick demo
*
* Install + run:
*
* 		# from parent directory
*
*		npm install
*		gulp server
*
*/


var root = __dirname + '/..';
var express = require('express');
var app = express();

app.use('/dist', express.static(root + '/dist'));
app.use('/', express.static(root + '/demo'));

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!').end();
});

var port = process.env.PORT || process.env.VMC_APP_PORT || 80;
var server = app.listen(port, function() {
	console.log('Web interface listening on port', port);
});
