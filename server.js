import express from 'express';
import http from 'http';
import { Server } from 'socket.io';  // Ispravi import za socket.io
import { connectDB } from './mongo.js'; // Dodaj .js ekstenziju kad koristiš `import`
import { register, login } from './prijava.js'; // Dodaj .js ekstenziju
import dotenv from 'dotenv'; // Koristi import za dotenv

dotenv.config(); // Učitaj environment varijable

const app = express();
const server = http.createServer(app);
const io = new Server(server);  // Koristi Server umesto socketIo

connectDB();  // Spajanje na MongoDB

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.post('/register', (req, res) => register(req, res, io));
app.post('/login', (req, res) => login(req, res, io));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const authorizedUsers = new Set(['Radio Galaksija', 'ZI ZU', '__X__']);
const bannedUsers = new Set();
let guests = {};
let assignedNumbers = new Set();

io.on('connection', (socket) => {
    const uniqueSocketId = socket.id; // Koristimo socket.id umesto UUID
    const uniqueNumber = generateUniqueNumber();
    const nickname = `Gost-${uniqueNumber}`;

    // Dodaj novog gosta
    guests[uniqueSocketId] = { socketId: uniqueSocketId, nickname: nickname };

    console.log(`${nickname} se povezao.`);

    socket.emit('assignSocketId', uniqueSocketId); // Pošaljemo socket.id klijentu
    socket.broadcast.emit('newGuest', nickname);
    io.emit('updateGuestList', Object.values(guests));

    socket.on('userLoggedIn', async (username) => {
        if (authorizedUsers.has(username)) {
            guests[uniqueSocketId] = { socketId: uniqueSocketId, nickname: `${username} (Admin)` };
            console.log(`${username} je autentifikovan kao admin.`);
        } else {
            guests[uniqueSocketId] = { socketId: uniqueSocketId, nickname: username };
            console.log(`${username} se prijavio kao gost.`);
        }
        io.emit('updateGuestList', Object.values(guests));
    });

    socket.on('chatMessage', (msgData) => {
        const time = new Date().toLocaleTimeString();
        const messageToSend = {
            text: msgData.text,
            bold: msgData.bold,
            italic: msgData.italic,
            color: msgData.color,
            nickname: guests[uniqueSocketId].nickname,
            time: time
        };
        io.emit('chatMessage', messageToSend);
    });

    socket.on('disconnect', () => {
        console.log(`${guests[uniqueSocketId].nickname} se odjavio.`);
        assignedNumbers.delete(parseInt(guests[uniqueSocketId].nickname.split('-')[1], 10));
        delete guests[uniqueSocketId];
        io.emit('updateGuestList', Object.values(guests));
    });
});

// Funkcija za generisanje jedinstvenog broja
function generateUniqueNumber() {
    let number;
    do {
        number = Math.floor(Math.random() * 8889) + 1111;
    } while (assignedNumbers.has(number));
    assignedNumbers.add(number);
    return number;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});
