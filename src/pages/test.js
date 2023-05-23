var ping = require('ping');

function performPing(hosts) {
  hosts.forEach(function(host) {
    ping.sys.probe(host, function(isAlive) {
      var msg = isAlive ? 'Host ' + host + ' is alive' : 'Host ' + host + ' is dead';
      console.log(msg);
    });
  });
}

module.exports = {
  performPing: performPing
};
