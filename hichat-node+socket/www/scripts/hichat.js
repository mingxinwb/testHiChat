window.onload = function() {
    var chat = new Chat();
    chat.init();
};

var Chat = function() {
    this.socket = null;
};

Chat.prototype = {
    init: function() {
        var that = this;

        this.socket = io.connect();
        this.socket.on('connect', function() {
            console.log('client connected to server now.');
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        // set nickname
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickname = document.getElementById('nicknameInput').value;
            if (nickname.trim().length !=0) {
                that.socket.emit('login', nickname);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);

        // nickname existed
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = 'oops...nickname is taken, choose another pls';
        });

        // log in successed, remove loginWrapper, can chat now
        this.socket.on('loginSuccess', function() {
            var nickname = document.getElementById('nicknameInput').value
            console.log(nickname + ' has login.');
            document.title = 'HiChat | ' + nickname;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });

        // log out and emit all other left users
        this.socket.on('system', function(name, usercount, type) {
            var msg = name + (type == 'login' ? ' joined' : ' left');
            that._displayNewMsg('system', msg, 'red');
            document.getElementById('status').textContent = usercount + (usercount > 1 ? ' users' : ' user') + ' online';
        });
         
        // send msg with color to everyone
        document.getElementById('sendBtn').addEventListener('click', function() {
            var msgInput = document.getElementById('messageInput');
            var msg = msgInput.value;
            var color = document.getElementById('colorStyle').value;
            msgInput.value = '';
            msgInput.focus();
            if (msg.trim().length !=0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);

        // see other's msg
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });

        // send image
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length !=0) {
                var file = this.files[0];
                var reader = new FileReader();
                if (!reader) {
                    Chat.prototype._displayNewMsg('system', "your browser doesn\'t support file reader", 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            };
        }, false);

        // receive image
        this.socket.on('newImg', function(user,img) {
            that._displayImage(user, img);
        });

        // add emoji
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });

        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' +target.title + ']';
            };
        }, false);
    },

    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);
        var msg = Chat.prototype._showEmoji(msg);

        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' 
                                 + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper');
        var docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },

    _showEmoji: function(msg) {
        var match, result = msg;
        var reg = /\[emoji:\d+\]/g;
        var emojiIndex;
        var totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    }
};