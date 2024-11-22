const storage = require('node-persist');
const path = require('path');
const fs = require('fs');

// Putanja do direktorijuma u kojem će biti sačuvani podaci
const storageDir = path.join(__dirname, 'cuvati');

// Automatska inicijalizacija skladišta
async function initializeStorage() {
    try {
        // Ako direktorijum ne postoji, kreiraj ga
        if (!fs.existsSync(storageDir)) {
            console.log('[INFO] Direktorijum "cuvati" ne postoji. Kreiramo ga...');
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Inicijalizacija skladišta sa direktorijumom
        await storage.init({
            dir: storageDir, // koristi lokalni direktorijum 'cuvati'
            forgiveParseErrors: true, // ignoriši greške prilikom parsiranja podataka
            ttl: false, // isključuje automatsko podešavanje vremena isteka podataka
            encrypt: false, // isključuje šifrovanje, podatke čuva u plain text formatu
            raw: true, // onemogućava heširanje ključeva
        });
        console.log('[INFO] Skladište je uspešno inicijalizovano.');
        console.log(`[INFO] Skladište se nalazi u direktorijumu: ${storageDir}`);
    } catch (error) {
        console.error('[ERROR] Greška pri inicijalizaciji skladišta:', error);
    }
}

// Funkcija za dodavanje ili ažuriranje podataka o gostu
async function saveGuestData(uniqueNumber, username, color) {
    try {
        await initializeStorage();

        // Provera da li je username validan
        if (!username || typeof username !== 'string') {
            console.error('[ERROR] Nevalidan username');
            return;
        }

        // Kreiraj objekat s novim vrednostima
        const guestData = {
            nik: username,
            color: color || 'default',  // Ako boja nije prosleđena, koristi 'default'
        };

        // Provera da li već postoji gost sa istim ključem
        const existingGuestData = await storage.getItem(uniqueNumber);
        if (existingGuestData) {
            console.log(`[INFO] Ažuriranje podataka za gosta ${username} sa ključem ${uniqueNumber}`);
        } else {
            console.log(`[INFO] Dodavanje novih podataka za gosta ${username} sa ključem ${uniqueNumber}`);
        }

        // Logovanje podataka pre nego što ih sačuvamo
        console.log(`[INFO] Sačuvaj podatke za gosta ${username} (key: ${uniqueNumber}):`, guestData);

        // Prvo obriši stare podatke pre nego što sačuvaš nove
        await storage.removeItem(uniqueNumber);

        // Sačuvaj ažurirane podatke pod ključem koji je generisan
        await storage.setItem(uniqueNumber, guestData);
        console.log(`[INFO] Podaci za gosta ${username} sa ključem "${uniqueNumber}" su sačuvani:`, guestData);
    } catch (err) {
        console.error(`[ERROR] Greška prilikom čuvanja podataka za gosta ${username}:`, err);
    }
}

// Funkcija za učitavanje svih gostiju
async function loadAllGuests() {
    try {
        const keys = await storage.keys();

        if (keys.length === 0) {
            console.log('[INFO] Nema gostiju. Dodajte goste!');
            return;
        }

        console.log(`[INFO] Nađeno ${keys.length} gostiju:`, keys);

        const guestPromises = keys.map(async (key) => {
            const guestData = await storage.getItem(key);

            // Ako podaci nisu pronađeni, postavi ih na prazan string
            if (!guestData) {
                console.warn(`[WARN] Podaci za gosta ${key} nisu pronađeni ili su nevalidni.`);
                return `${key}: Nema podataka`; // Vraćamo string ako nema podataka
            }

            // Vraćamo podatke kao string
            return `${key}: ${JSON.stringify(guestData)}`;
        });

        // Obrađujemo sve goste i logujemo ih
        const guestDataStrings = await Promise.all(guestPromises);
        guestDataStrings.forEach(data => console.log(data));

    } catch (err) {
        console.error('[ERROR] Greška prilikom učitavanja svih gostiju:', err);
    }
}

// Funkcija za učitavanje specifičnog gosta
async function loadGuestDataByKey(key) {
    try {
        const guestData = await storage.getItem(key);
        if (guestData) {
            console.log('[INFO] Podaci za gosta:', guestData);
        } else {
            console.log(`[INFO] Nema podataka za gosta sa ključem: ${key}`);
        }
    } catch (err) {
        console.error(`[ERROR] Greška prilikom učitavanja podataka za gosta sa ključem: ${key}`, err);
    }
}

// Testiranje servera
async function testServer() {
    const uniqueNumber1 = 1234; // Ovo bi trebalo da bude broj generisan od servera
    const uniqueNumber2 = 5678; // Drugi broj generisan od servera

    await saveGuestData(uniqueNumber1, 'Gost-1', 'plava');
    await saveGuestData(uniqueNumber2, 'Gost-2', 'crvena');
    await loadAllGuests();
}

// Pokreni server
async function startServer() {
    await initializeStorage();  // Inicijalizuj storage pre nego što nastavimo sa serverom
    console.log('[INFO] Server je spreman!');
    await loadAllGuests();  // Učitaj sve goste na početku
}

// Pokreni server
startServer();

// Izvoz funkcija za dodatnu upotrebu
module.exports = {
    saveGuestData,
    loadAllGuests,
    initializeStorage,
};
