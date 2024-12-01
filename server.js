const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};
let users = {};

wss.on('connection', (ws) => {
    let currentUser = '';

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'login':
                currentUser = data.username;
                users[currentUser] = ws;
                ws.send(JSON.stringify({ type: 'roomList', rooms: Object.keys(rooms) }));
                break;
            case 'createRoom':
                if (!rooms[data.room]) {
                    rooms[data.room] = [];
                    broadcastRoomList();
                }
                break;
            case 'joinRoom':
                if (rooms[data.room]) {
                    rooms[data.room].push(currentUser);
                }
                break;
            case 'message':
                if (rooms[data.room]) {
                    rooms[data.room].forEach(user => {
                        if (users[user]) {
                            users[user].send(JSON.stringify({
                                type: 'message',
                                user: currentUser,
                                text: data.text,
                                room: data.room
                            }));
                        }
                    });
                }
                break;
        }
    });

    ws.on('close', () => {
        delete users[currentUser];
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(user => user !== currentUser);
        }
    });
});

function broadcastRoomList() {
    const roomListMessage = JSON.stringify({ type: 'roomList', rooms: Object.keys(rooms) });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(roomListMessage);
        }
    });
}

console.log('WebSocket server is running on ws://localhost:8080');
