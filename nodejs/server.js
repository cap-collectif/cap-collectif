const net = require('net');
const fs = require('fs');

const socket = 'node_ssr.sock';
const bundlePath = '/var/www/web/js/';

let user = 'capco';
let bundleFileName = 'server-bundle.js';
let currentArg;

function Handler() {
  this.queue = [];
  this.initialized = false;
}

Handler.prototype.handle = function (connection) {
  const callback = function () {
    connection.setEncoding('utf8');
    let completeData = '';
    connection.on('data', (data) => {
      completeData += data;
      try {
        const result = eval(completeData);
        console.log('[Node.js server] Processed request !');
        connection.write(result);
        connection.end();
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log('[Node.js server] Received incomplete data !');
        }
      }
    });
  };
  if (this.initialized) {
    callback();
  } else {
    this.queue.push(callback);
  }
};

Handler.prototype.initialize = function () {
  console.log(`[Node.js server] Processing ${this.queue.length} pending requests`);
  let callback = this.queue.pop();
  while (callback) {
    callback();
    callback = this.queue.pop();
  }

  this.initialized = true;
};

const handler = new Handler();

process.argv.forEach((val) => {
  if (val[0] == '-') {
    user = 'capco';
    // currentArg = val.slice(1);
    // return;
  }

  // if (currentArg == 'user') {
  //   console.log('User is '+ val);
  //   user = val;
  // }
});

try {
  fs.mkdirSync(bundlePath);
} catch (e) {
  if (e.code != 'EEXIST') throw e;
}

require(bundlePath + bundleFileName);
console.log(`[Node.js server] Loaded server bundle: ${bundlePath}${bundleFileName}`);
handler.initialize();

const unixServer = net.createServer((connection) => {
  handler.handle(connection);
});

fs.watchFile(bundlePath + bundleFileName, (curr) => {
  if (curr && curr.blocks && curr.blocks > 0) {
    if (handler.initialized) {
      console.log('[Node.js server] Restarting the node process, to reload server bundle!');
      unixServer.close();
      process.exit();
      return;
    }

    require(bundlePath + bundleFileName);
    console.log(`[Node.js server] Loaded server bundle: ${bundlePath}${bundleFileName}`);
    handler.initialize();
  }
});

unixServer.listen(socket, () => {
  const sock = `${process.cwd()}/${socket}`;
  fs.chmodSync(sock, '777');
  if (user == "capco") {
    console.log(`[Node.js server] Giving access to socket for "${user}".`)
    fs.chownSync(sock, 1000, 1000);
  }
  console.log(`[Node.js server] Listening socket: unix://${sock}`);
});

process.on('SIGINT', () => {
  unixServer.close();
  process.exit();
});
