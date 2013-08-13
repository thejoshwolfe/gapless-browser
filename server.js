var express = require('express');
var ws = require('ws');
var path = require('path');
var http = require('http');

var app = express();
app.use(express.static(path.join(__dirname, "public")));
var server = http.createServer(app);
server.listen(process.env.PORT || 10491, function() {
  console.info("Listening at http://0.0.0.0:" +
    server.address().port + "/");
});
