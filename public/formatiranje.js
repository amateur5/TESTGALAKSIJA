const socket = io();

let isBold = true;
let isItalic = true;
let currentColor = '#FFFFFF';

// Objekat za čuvanje podataka o gostima
const guestsData = {};

// Funkcija za BOLD formatiranje
document.getElementById('boldBtn').addEventListener('click', function() {
    isBold = !isBold;
    updateInputStyle();
});

// Funkcija za ITALIC formatiranje
document.getElementById('italicBtn').addEventListener('click', function() {
    isItalic = !isItalic;
    updateInputStyle();
});

// Funkcija za biranje boje
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
    inputField.style.fontWeight = isBold ? 'bold' : 'normal';
    inputField.style.fontStyle = isItalic ? 'italic' : 'normal';
    inputField.style.color = currentColor;
}

// Kada korisnik pritisne Enter
document.getElementById('chatInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let message = this.value;
        socket.emit('chatMessage', {
            text: message,
            bold: isBold,
            italic: isItalic,
            color: currentColor
        });
        this.value = ''; // Isprazni polje za unos
    }
});

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

// Funkcija za dodavanje stilova gostima
function addGuestStyles(guestElement, guestId) {
    const colorPickerButton = document.createElement('input');
    colorPickerButton.type = 'color';
    colorPickerButton.classList.add('colorPicker');
     guestsData[guestId] = { color: 'currentColor', isBold: true, isItalic: true };
     colorPickerButton.addEventListener('input', function() {
        guestElement.style.color = this.value;
        guestsData[guestId].color = this.value; // Ažuriraj boju u objektu
    });

    const boldButton = document.createElement('button');
    boldButton.textContent = 'B';
    boldButton.addEventListener('click', function() {
        
    });

    const italicButton = document.createElement('button');
    italicButton.textContent = 'I';
    italicButton.addEventListener('click', function() {
       
    });

    guestElement.appendChild(colorPickerButton);
    
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

    // Primeni postojeće stilove ako ih ima
    newGuest.style.color = guestsData[guestId].color;
    newGuest.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
    newGuest.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';

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
         guestsData[guestId] = { color: 'currentColor', isBold: true, isItalic: true };
     }

        newGuest.style.color = guestsData[guestId].color;
        newGuest.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
        newGuest.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';

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
