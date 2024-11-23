// Objekat za čuvanje podataka o gostima (bez localStorage)
const guestsData = {};

// Funkcija za dodavanje stilova gostima
function addGuestStyles(guestElement, guestId) {
    // Prvo proveri ako postoji stil u `guestsData` za tog gosta
    if (guestsData[guestId]) {
        guestElement.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
        guestElement.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';
        guestElement.style.color = guestsData[guestId].color || '#808080'; // Default boja je siva
    } else {
        // Ako stilovi nisu postavljeni, postavi defaultne
        guestElement.style.fontWeight = 'normal';
        guestElement.style.fontStyle = 'normal';
        guestElement.style.color = '#808080'; // Default boja
    }
}

// Kada nov gost dođe
socket.on('newGuest', function(nickname) {
    const guestId = `guest-${nickname}`;
    const guestList = document.getElementById('guestList');

    const newGuest = document.createElement('div');
    newGuest.classList.add('guest');
    newGuest.id = guestId;
    newGuest.textContent = nickname;

    // Dodaj novog gosta u guestsData ako ne postoji
    if (!guestsData[guestId]) {
        guestsData[guestId] = { color: '#808080', isBold: true, isItalic: true };  // Default stilovi
    }

    addGuestStyles(newGuest, guestId);  // Dodaj stilove za gosta

    guestList.appendChild(newGuest); // Dodaj novog gosta u listu
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
        newGuest.id = guestId;
        newGuest.textContent = nickname;

        // Zadržavanje postojećih stilova iz `guestsData`
        if (!guestsData[guestId]) {
            guestsData[guestId] = { color: '#808080', isBold: true, isItalic: true }; // Default
        }

        addGuestStyles(newGuest, guestId); // Dodaj stilove za novog gosta
        guestList.appendChild(newGuest); // Dodaj u listu
    });
});

// Funkcija za biranje boje (za trenutnog korisnika)
document.getElementById('colorBtn').addEventListener('click', function() {
    document.getElementById('colorPicker').click();
});

// Kada korisnik izabere boju
document.getElementById('colorPicker').addEventListener('input', function() {
    currentColor = this.value;
    updateInputStyle();  // Update input field style

    // Update color for the current user
    guestsData[userUUID].color = this.value;  // Save the selected color for the user
    updateGuestStyles(userUUID); // Update color in the guest list
});

// Funkcija za primenu stilova na polju za unos
function updateInputStyle() {
    let inputField = document.getElementById('chatInput');
    inputField.style.fontWeight = 'normal'; // Stil za bold i italic je default
    inputField.style.fontStyle = 'normal';
    inputField.style.color = currentColor;
}

// Funkcija za ažuriranje stilova za gosta u listi
function updateGuestStyles(guestId) {
    const guestElement = document.getElementById(guestId);
    if (guestElement && guestsData[guestId]) {
        guestElement.style.color = guestsData[guestId].color;
    }
}
