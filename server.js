const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./mongo');
const { register, login } = require('./prijava');
const { initializeStorage, saveGuestData, loadGuestData } = require('./storage');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

connectDB();
initializeStorage(); // Inicijalizuj storage pre nego što nastavimo sa serverom

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

// Učitaj podatke o gostima iz storage-a prilikom pokretanja servera
async function loadInitialGuestData() {
    const storedGuests = await loadGuestData();
    for (const [socketId, guestData] of Object.entries(storedGuests)) {
        guests[socketId] = guestData;
    }
}
loadInitialGuestData();

io.on('connection', (socket) => {
    const uniqueSocketId = socket.id; // Koristimo socket.id umesto UUID
    const uniqueNumber = generateUniqueNumber();
    const nickname = `Gost-${uniqueNumber}`;

    guests[uniqueSocketId] = { socketId: uniqueSocketId, nickname: nickname };

    saveGuestData(uniqueSocketId, { nickname, socketId: uniqueSocketId }); // Spasi podatke gosta u storage
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
        await saveGuestData(uniqueSocketId, guests[uniqueSocketId]); // Ažuriraj podatke gosta u storage
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

    socket.on('disconnect', async () => {
        console.log(`${guests[uniqueSocketId].nickname} se odjavio.`);
        assignedNumbers.delete(parseInt(guests[uniqueSocketId].nickname.split('-')[1], 10));
        await saveGuestData(uniqueSocketId, null); // Obrisi podatke gosta kad se odjavi
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
