var express = require('express');
var ws = require('ws');
var fs = require('fs');
var path = require('path');
var fs = require('fs');
var http = require('http');
var ogg = require('ogg');
var vorbis = require('vorbis-superjoe');
var util = require('util');
var Writable = require('stream').Writable;
var app = express();
var server = http.createServer(app);

var TEST_OGG = path.join(__dirname, "Danse Macabre.ogg");

// users may never send a web socket message longer than this
var MAX_SOCKET_MSG_LEN = 500;

var wss = new ws.Server({
  server: server,
  clientTracking: false,
});

wss.on('connection', onSocketConnection);

app.use(express.static(path.join(__dirname, "public")));
server.listen(process.env.PORT || 10491, onServerListening);

function onServerListening() {
  console.info("Listening at http://0.0.0.0:" +
    server.address().port + "/");
}

function onSocketConnection(socket) {
  var msgHandlers = {
    gimmeSomeOgg: gimmeSomeOgg,
  };
  socket.on('message', onMessage);

  function gimmeSomeOgg(msg) {
    var od = new ogg.Decoder();
    var oe = new ogg.Encoder();
    var vd = new vorbis.Decoder();
    var ve = new vorbis.Encoder();
    od.on('stream', function(stream) {
      vd.on('format', function(format) {
        console.log("format", format);
        vd.pipe(ve);
        ve.pipe(oe.stream());
        oe.pipe(new SocketStreamWriter(socket));
      });
      stream.pipe(vd);
    });
    fs.createReadStream(TEST_OGG).pipe(od);
  }

  function onMessage(data, flags) {
    if (flags.binary) {
      console.warn("WARNING: binary web socket message received");
      return;
    }
    if (data.length > MAX_SOCKET_MSG_LEN) {
      console.warn("WARNING: received web socket message of length",
        data.length, "max:", MAX_SOCKET_MSG_LEN);
      return;
    }
    var msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      console.warn("WARNING: received invalid JSON from web socket", err.message);
      return;
    }
    var handler = msgHandlers[msg.name];
    if (! handler) {
      console.warn("WARNING: no message handler for", msg.name);
      return;
    }
    handler(msg.value);
  }
}

util.inherits(SocketStreamWriter, Writable);
function SocketStreamWriter(socket) {
  Writable.call(this);
  this.socket = socket;
}

SocketStreamWriter.prototype._write = function(chunk, encoding, callback) {
  this.socket.send(chunk, callback);
}
