const socket = io();

// UUID za korisnika
let userUUID = localStorage.getItem('userUUID');
if (!userUUID) {
    userUUID = uuid.v4();  // Generišemo novi UUID ako ne postoji
    localStorage.setItem('userUUID', userUUID); // Čuvamo UUID u localStorage
}

let isBold = true; // Default je bold
let isItalic = true; // Default je italic
let currentColor = '#808080'; // Default boja je siva

// Objekat za čuvanje podataka o gostima
const guestsData = {};

// Funkcija za biranje boje (novi metod: paleta dugmadi)
document.getElementById('colorBtn').addEventListener('click', function() {
    // Možemo promeniti dugme za odabir boje ili koristiti paletu
    let colorPalette = document.createElement('div');
    colorPalette.style.display = 'flex';
    colorPalette.style.flexDirection = 'column';
    let colors = ['#808080', '#FF5733', '#33FF57', '#3357FF', '#FF33A8'];  // Primer boja
    colors.forEach(color => {
        let colorOption = document.createElement('div');
        colorOption.style.backgroundColor = color;
        colorOption.style.width = '30px';
        colorOption.style.height = '30px';
        colorOption.style.margin = '5px';
        colorOption.addEventListener('click', function() {
            currentColor = color;
            updateInputStyle();
            colorPalette.style.display = 'none'; // Sakrijemo paletu
        });
        colorPalette.appendChild(colorOption);
    });
    document.body.appendChild(colorPalette); // Dodajemo paletu u body
});

// Kada korisnik izabere boju iz palete
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
    newMessage.style.fontWeight = data.bold ? 'bold' : 'normal';
    newMessage.style.fontStyle = data.italic ? 'italic' : 'normal';
    newMessage.style.color = data.color;
    newMessage.innerHTML = `<strong style="color: ${data.color};">${data.nickname}:</strong> ${data.text} <span style="font-size: 0.8em; color: gray;">(${data.time})</span>`;
    messageArea.prepend(newMessage);
    messageArea.scrollTop = 0; // Automatsko skrolovanje
});

// Funkcija za dodavanje stilova gostima
function addGuestStyles(guestElement, guestId, nickname) {
    guestElement.style.fontWeight = isBold ? 'bold' : 'normal';
    guestElement.style.fontStyle = isItalic ? 'italic' : 'normal';
    guestElement.style.color = currentColor;

    // Čuvanje stila u guestsData
    guestsData[guestId] = {
        color: currentColor,
        isBold: isBold,
        isItalic: isItalic
    };
    localStorage.setItem(guestId, JSON.stringify(guestsData[guestId])); // Spasi u localStorage
}

// Kada nov gost dođe
socket.on('newGuest', function(nickname) {
    const guestId = `guest-${nickname}`;
    const guestList = document.getElementById('guestList');

    // Proveravamo da li je gost već u listi
    if (document.getElementById(guestId)) return;  // Ako već postoji, ne dodajemo ponovo

    const newGuest = document.createElement('div');
    newGuest.classList.add('guest');
    newGuest.id = guestId;
    newGuest.textContent = nickname;

    // Dodaj novog gosta u guestsData ako ne postoji
    if (!guestsData[guestId]) {
        guestsData[guestId] = { color: '#808080', isBold: true, isItalic: true };  // Default stilovi
    }

    newGuest.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
    newGuest.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';
    newGuest.style.color = guestsData[guestId].color;

    addGuestStyles(newGuest, guestId, nickname);

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
        newGuest.id = guestId;
        newGuest.textContent = nickname;

        // Zadržavanje postojećih stilova iz `guestsData`
        if (!guestsData[guestId]) {
            guestsData[guestId] = { color: '#808080', isBold: true, isItalic: true };
        }

        newGuest.style.fontWeight = guestsData[guestId].isBold ? 'bold' : 'normal';
        newGuest.style.fontStyle = guestsData[guestId].isItalic ? 'italic' : 'normal';
        newGuest.style.color = guestsData[guestId].color;

        addGuestStyles(newGuest, guestId, nickname);
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
