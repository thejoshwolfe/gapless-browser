(function() {
  var host = window.document.location.host;
  var pathname = window.document.location.pathname;
  var match = host.match(/^(.+):(\d+)$/);
  var port = match ? parseInt(match[2], 10) : 443;
  var hostName = match ? match[1] : host;
  var wsUrl = 'ws://' + hostName + ':' + port + pathname;
  var ws = createWs();

  var domStatus = document.getElementById("status");
  var domButton = document.getElementById("button");
  domButton.addEventListener("click", doIt, false);

  function doIt() {
    ws.send(JSON.stringify({name: 'gimmeSomeOgg'}));
  }

  function createWs() {
    var newWs = new WebSocket(wsUrl);
    newWs.onmessage = function(event) {
      domStatus.innerHTML = "message: " + event.data;
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
})();
