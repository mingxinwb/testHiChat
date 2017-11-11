const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

var users = [];

app.use('/', express.static(__dirname + '/www/'));

// listening on port:8080
server.listen(8080, () => {
    console.log('server start and listening on port:8080.');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });

    socket.on('login', (nickname) => {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            console.log(nickname + ' connected');
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    })
});





// // for test about socket.io
// io.on('connection', (socket) => {
//     console.log('a user connected');

//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });

//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//         io.emit('chat message', msg);
//     });

//     socket.on('pushBtn', (data) => {
//         console.log(data);
//     });

//     socket.on('foo', (data) => {
//         console.log(data);
//     });
// });