window.onload = () => {
    const chat = new Chat();
    chat.init();
};

const Chat = function() {
    this.socket = null;
};

Chat.prototype = {
    init: () => {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            console.log('connected to server.');
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
    }
};