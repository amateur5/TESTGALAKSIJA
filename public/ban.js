// Povezivanje sa serverom, pri čemu šaljemo korisničko ime
const socket = io.connect('http://localhost:3000', {
    query: { username: 'Radio Galaksija' }  // Zamenite sa korisničkim imenom, npr. 'ZI ZU'
});

// Event delegation: Postavljanje događaja na dvostruki klik za banovanje/odbanovanje gostiju unutar #guestList
document.getElementById('guestList').addEventListener('dblclick', (event) => {
    if (event.target.classList.contains('guest')) {  // Proveravamo da li je kliknuto na gosta
        const userId = event.target.getAttribute('data-id');  // Dohvatamo ID gosta
        if (!userId) {
            console.log("Element nema 'data-id' atribut, proverite HTML strukturu.");
            return;
        }

        console.log(`Gost ${userId} kliknut.`);  // Log za praćenje
        if (event.target.classList.contains('banned')) {
            // Ako je gost već banovan, šaljemo zahtev za odbanovanje
            socket.emit('unbanUser', userId);
            console.log(`Zahtev za odbanovanje gosta ${userId} poslat.`);
        } else {
            // Ako gost nije banovan, šaljemo zahtev za banovanje
            socket.emit('banUser', userId);
            console.log(`Zahtev za banovanje gosta ${userId} poslat.`);
        }
    } else {
        console.log("Kliknuto je van gost elementa.");
    }
});

// Slušalac za odgovor servera kada je korisnik banovan
socket.on('userBanned', (userId) => {
    console.log(`Gost ${userId} je banovan.`);  // Log za praćenje
    const bannedElements = document.querySelectorAll(`.guest[data-id='${userId}']`);
    bannedElements.forEach(el => {
        el.classList.add('banned');  // Dodajemo klasu 'banned' za banovanog gosta
        el.innerHTML += ' (B)';  // Dodajemo oznaku (B) kao indikaciju
    });
});

// Slušalac za odgovor servera kada je korisnik odbanovan
socket.on('userUnbanned', (userId) => {
    console.log(`Gost ${userId} je odbanovan.`);  // Log za praćenje
    const bannedElements = document.querySelectorAll(`.guest[data-id='${userId}']`);
    bannedElements.forEach(el => {
        el.classList.remove('banned');  // Uklanjamo klasu 'banned'
        el.innerHTML = el.innerHTML.replace(' (B)', '');  // Uklanjamo oznaku (B)
    });
});

// Slušalac za prikaz greške u slučaju nedostatka ovlašćenja
socket.on('error', (message) => {
    console.error(`Greška: ${message}`);  // Log greške
    alert(message);  // Prikazujemo poruku greške korisniku
});

// Dodatan log za potvrdu da je klijent povezan
socket.on('connect', () => {
    console.log('Povezan na server kao:', socket.io.opts.query.username);
});
