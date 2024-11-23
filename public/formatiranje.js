// Kada se klikne na dugme za boje
const colorBtn = document.getElementById("colorBtn");
const colorPicker = document.getElementById("colorPicker");
const chatInput = document.getElementById("chatInput");

// Kada korisnik izabere boju, ona se primenjuje na tekst u unosu, porukama i korisničkom imenu
colorBtn.addEventListener("click", function() {
    colorPicker.click(); // Otvara color picker
});

// Kada korisnik izabere boju
colorPicker.addEventListener("input", function() {
    const selectedColor = colorPicker.value;
    
    // Postavljanje boje u textarea (polje za unos)
    chatInput.style.color = selectedColor;

    // Takođe, možemo čuvati boju za kasniju upotrebu, npr. za prikazivanje u porukama i imenu
    const userName = "Broj-Gost";  // Možeš da ubaciš dinamiku za korisničko ime
    const message = chatInput.value;

    // Prikazivanje korisničkog imena i poruke sa izabranom bojom
    const messageArea = document.getElementById("messageArea");
    const guestList = document.getElementById("guestList");

    // Dodavanje nove poruke u prikaz sa bojom
    const newMessage = document.createElement("div");
    newMessage.innerHTML = `<span style="color: ${selectedColor};">${userName}: </span>${message}`;
    messageArea.appendChild(newMessage);

    // Dodavanje korisnika sa bojom u listu
    const newGuest = document.createElement("div");
    newGuest.innerHTML = `<span style="color: ${selectedColor};">${userName}</span>`;
    guestList.appendChild(newGuest);

    // Očistiti polje za unos nakon što se poruka prikaže
    chatInput.value = "";
});
