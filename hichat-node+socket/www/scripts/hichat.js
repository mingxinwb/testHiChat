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

        // log out and emit all other left users
        this.socket.on('system', (name, usercount, type) => {
            const msg = name + (type == 'login' ? ' joined' : ' left');
            Chat.prototype._displayNewMsg('system', msg, 'red');
            document.getElementById('status').textContent = usercount + (usercount > 1 ? ' users' : ' user') + ' online';
        });
         
        // send msg to everyone
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

        // see other's msg
        this.socket.on('newMsg', (user, msg) => {
            Chat.prototype._displayNewMsg(user, msg);
        });

        // send image
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length !=0) {
                const file = this.files[0];
                const reader = new FileReader();
                if (!reader) {
                    Chat.prototype._displayNewMsg('system', "your browser doesn\'t support file reader", 'red');
                    this.value = '';
                    return;
                };
                reader.onload = (e) => {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    Chat.prototype._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            };
        }, false);

        // receive image
        this.socket.on('newImg', (user,img) => {
            Chat.prototype._displayImage(user, img);
        })
    },

    _displayNewMsg: (user, msg, color) => {
        const container = document.getElementById('historyMsg');
        const msgToDisplay = document.createElement('p');
        const date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _displayImage: (user, imgData, color) => {
        const container = document.getElementById('historyMsg');
        const msgToDisplay = document.createElement('p');
        const date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' 
                                 + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};