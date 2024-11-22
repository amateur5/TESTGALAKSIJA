const storage = require('node-persist');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Dodaj UUID generator

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
async function saveGuestData(username, color) {
    try {
        await initializeStorage();

        // Provera da li je username validan
        if (!username || typeof username !== 'string') {
            console.error('[ERROR] Nevalidan username');
            return;
        }

        // Generiši UUID za gosta
        const uuid = uuidv4();

        // Kreiraj objekat s novim vrednostima
        const guestData = {
            nik: username,
            color: color || 'default', // Ako boja nije prosleđena, koristi 'default'
        };

        // Provera da li već postoji gost sa istim UUID
        const existingGuestData = await storage.getItem(uuid);
        if (existingGuestData) {
            console.log(`[INFO] Ažuriranje podataka za gosta ${username} sa UUID ${uuid}`);
        } else {
            console.log(`[INFO] Dodavanje novih podataka za gosta ${username} sa UUID ${uuid}`);
        }

        // Sačuvaj podatke pod UUID-om
        await storage.setItem(uuid, guestData);
        console.log(`[INFO] Podaci za gosta ${username} sa UUID "${uuid}" su sačuvani:`, guestData);

        return uuid; // Vrati UUID kako bi se mogao koristiti
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
async function loadGuestDataByUUID(uuid) {
    try {
        if (!uuid) {
            console.error('[ERROR] UUID nije validan pri učitavanju podataka za gosta');
            return;
        }
        const guestData = await storage.getItem(uuid);
        if (guestData) {
            console.log('[INFO] Podaci za gosta:', guestData);
        } else {
            console.log(`[INFO] Nema podataka za gosta sa UUID: ${uuid}`);
        }
    } catch (err) {
        console.error(`[ERROR] Greška prilikom učitavanja podataka za gosta sa UUID: ${uuid}`, err);
    }
}

// Testiranje servera
async function testServer() {
    // Kreiraj dva gosta
    const uuid1 = await saveGuestData('Gost-1', 'plava');
    const uuid2 = await saveGuestData('Gost-2', 'crvena');

    // Prikaz svih gostiju
    await loadAllGuests();

    // Učitaj specifične goste
    await loadGuestDataByUUID(uuid1);
    await loadGuestDataByUUID(uuid2);
}

// Pokreni server
async function startServer() {
    await initializeStorage(); // Inicijalizuj storage pre nego što nastavimo sa serverom
    console.log('[INFO] Server je spreman!');
    await loadAllGuests(); // Učitaj sve goste na početku
}

// Pokreni server
startServer();

// Izvoz funkcija za dodatnu upotrebu
module.exports = {
    saveGuestData,
    loadAllGuests,
    loadGuestDataByUUID,
    initializeStorage,
};
