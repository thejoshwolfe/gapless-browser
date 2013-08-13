(function() {
  var host = window.document.location.host;
  var pathname = window.document.location.pathname;
  var match = host.match(/^(.+):(\d+)$/);
  var port = match ? parseInt(match[2], 10) : 443;
  var hostName = match ? match[1] : host;
  var wsUrl = 'ws://' + hostName + ':' + port + pathname;
  var ws = createWs();
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  var domStatus = document.getElementById("status");
  var domButton = document.getElementById("button");
  domButton.addEventListener("click", doIt, false);

  function doIt() {
    ws.send(JSON.stringify({name: 'gimmeSomeOgg'}));
  }

  function createWs() {
    var newWs = new WebSocket(wsUrl);
    newWs.onmessage = function(event) {
      var blob = event.data;
      domStatus.innerHTML = "blob length: " + blob.size;
      blobToBuffer(blob, function(buffer) {
        domStatus.innerHTML = "buffer length: " + buffer.byteLength;
        audioContext.decodeAudioData(buffer, playThisBuffer, function() {
          domStatus.innerHTML = "error decoding";
        });
      });
    };
    newWs.onerror = function(event) {
      domStatus.innerHTML = "error. reconnecting...";
      setTimeout(function() {
        ws = createWs();
      }, 1000);
    };
    newWs.onclose = function(event) {
      domStatus.innerHTML = "closed. reconnecting...";
      setTimeout(function() {
        ws = createWs();
      }, 1000);
    };
    newWs.onopen = function() {
      domStatus.innerHTML = "open";
    };
    return newWs;
  }
  function blobToBuffer(blob, cb) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
      var buffer = fileReader.result;
      cb(buffer);
    };
    fileReader.readAsArrayBuffer(blob);
  }
  function playThisBuffer(buffer) {
    domStatus.innerHTML = "kickin ass";
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  }
})();
