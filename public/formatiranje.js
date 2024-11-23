const socket = io();

// UUID za korisnika
let userUUID = localStorage.getItem('userUUID');
if (!userUUID) {
    userUUID = uuid.v4();  // Generišemo novi UUID ako ne postoji
    localStorage.setItem('userUUID', userUUID); // Čuvamo UUID u localStorage
}

let currentColor = '#000000'; // Boja za poruke

// Objekat za čuvanje podataka o gostima
const guestsData = {};

// Funkcija za biranje boje poruke (glavni color picker)
document.getElementById('colorBtn').addEventListener('click', function() {
    document.getElementById('colorPicker').click();
});

// Kada korisnik izabere boju iz palete
document.getElementById('colorPicker').addEventListener('input', function() {
    currentColor = this.value;
    updateInputStyle();
});

// Primena stilova na polju za unos
function updateInputStyle() {
    let inputField = document.getElementById('chatInput');
    inputField.style.color = currentColor;
}

// Kada korisnik pritisne Enter
document.getElementById('chatInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let message = this.value;
        socket.emit('chatMessage', {
            text: message,
            color: currentColor,
            uuid: userUUID  // Pošaljemo UUID sa porukom
        });
        this.value = ''; // Isprazni polje za unos
    }
});

// Kada server pošalje poruku
socket.on('chatMessage', function(data) {
    let messageArea = document.getElementById('messageArea');
    let newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.style.color = data.color;
    newMessage.innerHTML = `<strong>${data.nickname}:</strong> ${data.text} <span style="font-size: 0.8em; color: gray;">(${data.time})</span>`;
    messageArea.prepend(newMessage);
    messageArea.scrollTop = 0; // Automatsko skrolovanje
});

// Funkcija za dodavanje stilova gostima (color picker je uklonjen za goste)
function addGuestStyles(guestElement, guestId) {
    const guestList = document.getElementById('guestList');
    const newGuest = document.createElement('div');
    newGuest.classList.add('guest');
    newGuest.textContent = guestId;

    // Dodaj novog gosta u guestsData ako ne postoji
    if (!guestsData[guestId]) {
        guestsData[guestId] = { color: '#000000' };
    }

    // Primeni postojeće stilove ako ih ima
    newGuest.style.color = guestsData[guestId].color;

    guestList.appendChild(newGuest); // Dodaj novog gosta
}

// Kada nov gost dođe
socket.on('newGuest', function(nickname) {
    const guestId = `guest-${nickname}`;
    const guestList = document.getElementById('guestList');
    const newGuest = document.createElement('div');
    newGuest.classList.add('guest');
    newGuest.textContent = nickname;

    // Dodaj novog gosta u guestsData ako ne postoji
    if (!guestsData[guestId]) {
        guestsData[guestId] = { color: '#000000' };
    }

    // Primeni postojeće stilove ako ih ima
    newGuest.style.color = guestsData[guestId].color;

    addGuestStyles(newGuest, guestId); // Dodaj stilove

    guestList.appendChild(newGuest); // Dodaj novog gosta
});

// Ažuriranje liste gostiju bez resetovanja stilova
socket.on('updateGuestList', function(users) {
    const guestList = document.getElementById('guestList');
    guestList.innerHTML = ''; // Očisti trenutnu listu

    // Kreiraj nove elemente za sve korisnike
    users.forEach(nickname => {
        const guestId = `guest-${nickname}`;
        const newGuest = document.createElement('div');
        newGuest.classList.add('guest');
        newGuest.textContent = nickname;

        // Zadržavanje postojećih stilova iz `guestsData`
        if (!guestsData[guestId]) {
            guestsData[guestId] = { color: '#000000' };
        }

        newGuest.style.color = guestsData[guestId].color;

        addGuestStyles(newGuest, guestId); // Dodaj stilove za novog gosta
        guestList.appendChild(newGuest); // Dodaj u listu
    });
});

// Funkcija za brisanje chata
function deleteChat() {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = ''; // Očisti sve poruke
    alert('Chat je obrisan.'); // Obaveštenje korisniku
}

// Osluškivanje klika na dugme "D"
document.getElementById('openModal').onclick = function() {
    deleteChat(); // Pozivamo funkciju za brisanje chata
};
