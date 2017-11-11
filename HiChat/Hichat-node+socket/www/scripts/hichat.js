window.onload = () => {
    const chat = new Chat();
    chat.init();
};

var Chat = function() {
    this.socket = null;
};

Chat.prototype = {
    init: () => {
        const that = this;

        this.socket = io.connect();
        this.socket.on('connect', () => {
            console.log('client connected to server now.');
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        // set nickname
        document.getElementById('loginBtn').addEventListener('click', () => {
            const nickname = document.getElementById('nicknameInput').value;
            if (nickname.trim().length !=0) {
                that.socket.emit('login', nickname);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);

        // nickname existed
        this.socket.on('nickExisted', () => {
            document.getElementById('info').textContent = 'oops...nickname is taken, choose another pls';
        });

        // log in successed, remove loginWrapper, can chat now
        this.socket.on('loginSuccess', () => {
            const nickname = document.getElementById('nicknameInput').value
            console.log(nickname + ' has login.');
            document.title = 'HiChat | ' + nickname;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });

        //log out and emit all other left users
        this.socket.on('system', (name, usercount, type) => {
            const msg = name + (type == 'login' ? ' joined' : ' left');
            Chat.prototype._displayNewMsg('system', msg, 'red');
            document.getElementById('status').textContent = usercount + (usercount > 1 ? ' users' : ' user') + ' online';
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            const msgInput = document.getElementById('messageInput');
            const msg = msgInput.value;
            msgInput.value = '';
            msgInput.focus();
            if (msg.trim().length !=0) {
                that.socket.emit('postMsg', msg);
                Chat.prototype._displayNewMsg('me', msg);
            };
        }, false);

        this.socket.on('newMsg', (user, msg) => {
            Chat.prototype._displayNewMsg(user, msg);
        });
    },

    _displayNewMsg: (user, msg, color) => {
        const container = document.getElementById('historyMsg');
        const msgToDisplay = document.createElement('p');
        const date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};