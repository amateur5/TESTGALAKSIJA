const socket = io();

let isBold = false;
let isItalic = false;
let currentColor = '#000000'; // Boja za poruke

// Objekat za čuvanje podataka o gostima
const guestsData = {};

// Funkcija za BOLD formatiranje
const boldBtn = document.getElementById('boldBtn');
if (boldBtn) {
    boldBtn.addEventListener('click', function() {
        isBold = !isBold;
        updateInputStyle();
    });
}

// Funkcija za ITALIC formatiranje
const italicBtn = document.getElementById('italicBtn');
if (italicBtn) {
    italicBtn.addEventListener('click', function() {
        isItalic = !isItalic;
        updateInputStyle();
    });
}

// Funkcija za biranje boje poruke (glavni color picker)
const colorBtn = document.getElementById('colorBtn');
if (colorBtn) {
    colorBtn.addEventListener('click', function() {
        document.getElementById('colorPicker').click();
    });
}

// Kada korisnik izabere boju iz palete
const colorPicker = document.getElementById('colorPicker');
if (colorPicker) {
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
        updateInputStyle();
    });
}

// Primena stilova na polju za unos
function updateInputStyle() {
    let inputField = document.getElementById('chatInput');
    inputField.style.fontWeight = isBold ? 'bold' : 'normal';
    inputField.style.fontStyle = isItalic ? 'italic' : 'normal';
    inputField.style.color = currentColor;
}

// Kada korisnik pritisne Enter
const chatInput = document.getElementById('chatInput');
if (chatInput) {
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            let message = this.value.trim(); // Uklonite beline
            if (message === '') return; // Ne šaljite ako je prazna
            socket.emit('chatMessage', {
                text: message,
                bold: isBold,
                italic: isItalic,
                color: currentColor
            });
            this.value = ''; // Isprazni polje za unos
        }
    });
}

// Kada server pošalje poruku
socket.on('chatMessage', function(data) {
    let messageArea = document.getElementById('messageArea');
    let newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.style.fontWeight = data.bold ? 'bold' : 'normal';
    newMessage.style.fontStyle = data.italic ? 'italic' : 'normal';
    newMessage.style.color = data.color;
    newMessage.innerHTML = `<strong>${data.nickname}:</strong> ${data.text} <span style="font-size: 0.8em; color: gray;">(${data.time})</span>`;
    messageArea.prepend(newMessage);
    messageArea.scrollTop = 0; // Automatsko skrolovanje
});

// Funkcija za dodavanje stilova gostima (samo sa stilovima iz globalnih dugmadi)
function addGuestStyles(guestElement, guestId) {
    // Učitavamo prethodne stilove ako postoje
    if (guestsData[guestId]) {
        guestElement.style.color = guestsData[guestId].color || '#000000';
        guestElement.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
        guestElement.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';
    }
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
        guestsData[guestId] = { color: '#000000', isBold: false, isItalic: false };
    }

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
            guestsData[guestId] = { color: '#000000', isBold: false, isItalic: false };
        }

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
const openModalBtn = document.getElementById('openModal');
if (openModalBtn) {
    openModalBtn.onclick = function(event) {
        event.preventDefault(); // Sprečava default akciju
        deleteChat(); // Pozivamo funkciju za brisanje chata
    };
}
