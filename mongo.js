require('dotenv').config();
const mongoose = require('mongoose');

// Konekcija sa MongoDB bazom koristeći .env fajl za URI
const uri = process.env.MONGODB_URI;
console.log("MongoDB URI:", uri); // Privremeno dodajemo log za proveru URI-ja

const connectDB = async () => {
    try {
        await mongoose.connect(uri); // Povezivanje sa MongoDB
        console.log("Povezan sa bazom podataka!");
    } catch (error) {
        console.error("Greška prilikom povezivanja sa bazom:", error.message);
        process.exit(1); // Prekida aplikaciju ako ne može da se poveže
    }
};

// Definisanje modela za korisnike sa ulogama (admin ili guest)
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'guest'],  
        default: 'guest' // Podrazumevana rola ako nije postavljeno
    }  
}, { timestamps: true });  // Timestamps dodaju 'createdAt' i 'updatedAt' polja

// Kreiramo model za korisnike
const User = mongoose.model('User', userSchema);

// Funkcija za kreiranje ili ažuriranje admina
const ensureAdminExists = async () => {
    try {
        const adminUser = await User.findOne({ username: 'Radio Galaksija' });

        if (!adminUser) {
            // Ako "Radio Galaksija" ne postoji, kreiramo ga kao admina
            const admin = new User({
                username: 'Radio Galaksija', // Ime sa velikim početnim slovom
                password: 'admin_password_here', // Ovdje unesi lozinku
                role: 'admin' // Rola malim slovima
            });
            await admin.save();
            console.log('Admin "Radio Galaksija" je uspešno kreiran!');
        } else {
            // Ako postoji, postavljamo rolu na admin, ako već nije
            if (adminUser.role !== 'admin') {
                adminUser.role = 'admin'; // Postavljamo rolu na "admin" malim slovima
                await adminUser.save();
                console.log('Rola za "Radio Galaksija" je postavljena na admin!');
            } else {
                console.log('"Radio Galaksija" već ima rolu admina!');
            }
        }
    } catch (error) {
        console.error('Greška prilikom ažuriranja admina:', error.message);
    }
};

// Pozivanje funkcije za osiguranje admina
ensureAdminExists();

// Exportujemo konekciju i model korisnika
module.exports = { connectDB, User };
