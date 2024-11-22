const storage = require('node-persist');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // UUID biblioteka za generisanje jedinstvenih identifikatora

// Putanja do direktorijuma gde će se skladištiti podaci
const storageDir = path.join(__dirname, 'cuvati');

// Automatska inicijalizacija skladišta
async function initializeStorage() {
    try {
        // Provera da li direktorijum postoji, ako ne, kreiramo ga
        if (!fs.existsSync(storageDir)) {
            console.log('[INFO] Direktorijum "cuvati" ne postoji. Kreiramo ga...');
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Inicijalizacija skladišta
        const storageInit = await storage.init({
            dir: storageDir, // Postavljanje direktorijuma za skladištenje podataka
            forgiveParseErrors: true, // Ignorisanje grešaka prilikom parsiranja
            ttl: false, // Onemogućavanje automatskog isteka podataka
            encrypt: false, // Podaci se ne šifruju
            raw: true, // Ne koristi heširanje ključeva
        });

        if (storageInit) {
            console.log('[INFO] Skladište je uspešno inicijalizovano.');
            console.log(`[INFO] Skladište se nalazi u direktorijumu: ${storageDir}`);
        }
    } catch (error) {
        console.error('[ERROR] Greška pri inicijalizaciji skladišta:', error);
    }
}

// Funkcija za dodavanje ili ažuriranje podataka o gostu
async function saveGuestData(uuid, username, color = 'default') {
    try {
        // Provera da li je uuid validan
        if (!uuid || typeof uuid !== 'string') {
            console.error('[ERROR] UUID nije validan:', uuid);
            return;
        }

        // Provera da li je username validan
        if (!username || typeof username !== 'string') {
            console.error('[ERROR] Nevalidan username:', username);
            return;
        }

        // Inicijalizacija skladišta
        await initializeStorage();

        // Kreiranje objekta podataka o gostu
        const guestData = { username, color };

        // Provera da li već postoji gost sa istim UUID-om
        const existingGuestData = await storage.getItem(uuid);
        if (existingGuestData) {
            console.log(`[INFO] Ažuriranje podataka za gosta ${username} sa UUID ${uuid}`);
        } else {
            console.log(`[INFO] Dodavanje novih podataka za gosta ${username} sa UUID ${uuid}`);
        }

        // Logovanje podataka pre nego što ih sačuvamo
        console.log(`[INFO] Sačuvaj podatke za gosta ${username} (UUID: ${uuid}):`, guestData);

        // Prvo obriši stare podatke pre nego što sačuvaš nove
        await storage.removeItem(uuid);

        // Sačuvaj nove podatke
        await storage.setItem(uuid, guestData);
        console.log(`[INFO] Podaci za gosta ${username} sa UUID "${uuid}" su sačuvani.`);
    } catch (err) {
        console.error(`[ERROR] Greška prilikom čuvanja podataka za gosta ${username}:`, err);
    }
}

// Funkcija za učitavanje svih gostiju
async function loadAllGuests() {
    try {
        // Inicijalizacija skladišta
        await initializeStorage();

        const keys = await storage.keys();
        if (keys.length === 0) {
            console.log('[INFO] Nema gostiju. Dodajte goste!');
            return;
        }

        console.log(`[INFO] Nađeno ${keys.length} gostiju:`);

        // Provera da li skladište sadrži ispravne podatke
        const guestPromises = keys.map(async (key) => {
            const guestData = await storage.getItem(key);
            if (!guestData) {
                console.warn(`[WARN] Podaci za gosta ${key} nisu pronađeni ili su nevalidni.`);
                return `${key}: Nema podataka`;
            }
            return `${key}: ${JSON.stringify(guestData)}`;
        });

        // Prikazivanje podataka o svim gostima
        const guestDataStrings = await Promise.all(guestPromises);
        guestDataStrings.forEach(data => console.log(data));

    } catch (err) {
        console.error('[ERROR] Greška prilikom učitavanja svih gostiju:', err);
    }
}

// Funkcija za učitavanje specifičnog gosta
async function loadGuestData(uuid) {
    try {
        // Provera da li je UUID validan
        if (!uuid || typeof uuid !== 'string') {
            console.error('[ERROR] UUID nije validan pri učitavanju podataka za gosta');
            return null;
        }

        await initializeStorage();

        const guestData = await storage.getItem(uuid);
        if (guestData) {
            console.log('[INFO] Podaci za gosta:', guestData);
            return guestData;
        } else {
            console.log(`[INFO] Nema podataka za gosta sa UUID: ${uuid}`);
            return null;
        }
    } catch (err) {
        console.error(`[ERROR] Greška prilikom učitavanja podataka za gosta sa UUID: ${uuid}`, err);
    }
}

// Testiranje servera
async function testServer() {
    const uuid1 = uuidv4(); // Generisanje UUID-a za gosta
    const uuid2 = uuidv4(); // Drugi UUID za gosta

    await saveGuestData(uuid1, 'Gost-1', 'plava');
    await saveGuestData(uuid2, 'Gost-2', 'crvena');
    await loadAllGuests();  // Učitavanje svih gostiju
    await loadGuestData(uuid1);  // Učitavanje podataka za jednog gosta
}

// Pokreni server
async function startServer() {
    await initializeStorage();  // Inicijalizacija skladišta
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
    loadGuestData,
};
