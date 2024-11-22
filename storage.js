const storage = require('node-persist');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Uvoz UUID generatora

// Putanja do direktorijuma u kojem će biti sačuvani podaci
const storageDir = path.join(__dirname, 'cuvati');

// Automatska inicijalizacija skladišta
async function initializeStorage() {
    try {
        if (!fs.existsSync(storageDir)) {
            console.log('[INFO] Direktorijum "cuvati" ne postoji. Kreiramo ga...');
            fs.mkdirSync(storageDir, { recursive: true });
        }

        await storage.init({
            dir: storageDir,
            forgiveParseErrors: true,
            ttl: false,
            encrypt: false,
            raw: true,
        });
        console.log('[INFO] Skladište je uspešno inicijalizovano.');
        console.log(`[INFO] Skladište se nalazi u direktorijumu: ${storageDir}`);
    } catch (error) {
        console.error('[ERROR] Greška pri inicijalizaciji skladišta:', error);
    }
}

// Funkcija za dodavanje ili ažuriranje podataka o gostu
async function saveGuestData(uuid, username, color) {
    try {
        await initializeStorage();

        if (!username || typeof username !== 'string') {
            console.error('[ERROR] Nevalidan username');
            return;
        }

        const guestData = {
            username,
            color: color || 'default',
        };

        const existingGuestData = await storage.getItem(uuid);
        if (existingGuestData) {
            console.log(`[INFO] Ažuriranje podataka za gosta ${username} sa UUID ${uuid}`);
        } else {
            console.log(`[INFO] Dodavanje novih podataka za gosta ${username} sa UUID ${uuid}`);
        }

        console.log(`[INFO] Sačuvaj podatke za gosta ${username} (UUID: ${uuid}):`, guestData);

        await storage.removeItem(uuid); // Obriši stare podatke
        await storage.setItem(uuid, guestData); // Sačuvaj nove podatke
        console.log(`[INFO] Podaci za gosta ${username} sa UUID "${uuid}" su sačuvani:`, guestData);
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

            if (!guestData) {
                console.warn(`[WARN] Podaci za gosta ${key} nisu pronađeni ili su nevalidni.`);
                return `${key}: Nema podataka`;
            }

            return `${key}: ${JSON.stringify(guestData)}`;
        });

        const guestDataStrings = await Promise.all(guestPromises);
        guestDataStrings.forEach(data => console.log(data));

    } catch (err) {
        console.error('[ERROR] Greška prilikom učitavanja svih gostiju:', err);
    }
}

// Funkcija za učitavanje specifičnog gosta
async function loadGuestDataByUUID(uuid) {
    try {
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
    const uuid1 = uuidv4(); // Generisanje UUID-a
    const uuid2 = uuidv4(); // Generisanje drugog UUID-a

    await saveGuestData(uuid1, 'Gost-1', 'plava');
    await saveGuestData(uuid2, 'Gost-2', 'crvena');
    await loadAllGuests();
    await loadGuestDataByUUID(uuid1);
}

// Pokreni server
async function startServer() {
    await initializeStorage(); // Inicijalizacija skladišta
    console.log('[INFO] Server je spreman!');
    await loadAllGuests(); // Učitaj sve goste na početku
}

// Pokreni server
startServer();

// Izvoz funkcija za dodatnu upotrebu
module.exports = {
    saveGuestData,
    loadAllGuests,
    initializeStorage,
    loadGuestDataByUUID,
};
