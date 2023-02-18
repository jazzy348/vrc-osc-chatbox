const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const he = require('he')
const { body, validationResult } = require('express-validator');
const { Client, Message } = require('node-osc');
let client = new Client('127.0.0.1', 9000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
    return '0.0.0.0';
}

async function sendMessage(message) {
    try {
        client.send(
            new Message(
                "/chatbox/input",
                message,
                true
            )
        )
    } catch(err) {
        console.log(err)
    }

}

app.post('/sendMsg', [
    body('msg').trim().escape().notEmpty()
], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        console.log("Something went wrong:")
        console.log(validationResult(req))
        res.json({"status": "error"})
    } else {
        cleanMsg = he.decode(req.body.msg)
        console.log(`Sending message ${cleanMsg}`)
        sendMessage(cleanMsg)
        res.json({"status": "ok"})
    }
})

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/webpage.html');
})

app.listen(9050, () => {
    console.log(`OSC messaging app is now online, make sure you are on the same network and go to http://${getIPAddress()}:9050 to send messages to your in-game chatbox`);
})
