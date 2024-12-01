document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket('ws://localhost:8080');

    const roomList = document.getElementById('rooms');
    const messageInput = document.getElementById('message-input');
    const messagesDiv = document.getElementById('messages');
    const currentRoom = document.getElementById('current-room');

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
    });

    document.getElementById('create-room').addEventListener('click', () => {
        const newRoom = document.getElementById('new-room').value.trim();
        if (newRoom) {
            socket.send(JSON.stringify({ type: 'createRoom', room: newRoom }));
            addRoomToList(newRoom);
            document.getElementById('new-room').value = '';
        }
    });

    roomList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const room = e.target.textContent;
            socket.send(JSON.stringify({ type: 'joinRoom', room }));
            currentRoom.textContent = room;
            messagesDiv.innerHTML = '';
        }
    });

    document.getElementById('send-message').addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            socket.send(JSON.stringify({ type: 'message', text: message, room: currentRoom.textContent }));
            messageInput.value = '';
        }
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'roomList') {
            roomList.innerHTML = '';
            data.rooms.forEach(room => {
                addRoomToList(room);
            });
        } else if (data.type === 'message') {
            const messageElement = document.createElement('div');
            messageElement.textContent = `[${data.user}] ${data.text}`;
            messagesDiv.appendChild(messageElement);
        }
    });

    socket.addEventListener('open', () => {
        const username = prompt('Enter your username:');
        socket.send(JSON.stringify({ type: 'login', username }));
    });

    function addRoomToList(room) {
        const li = document.createElement('li');
        li.textContent = room;
        roomList.appendChild(li);
    }
});