document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    
    const boldBtn = document.getElementById("boldBtn");
    const italicBtn = document.getElementById("italicBtn");
    const colorBtn = document.getElementById("colorBtn");
    const colorPicker = document.getElementById("colorPicker");
    const chatInput = document.getElementById("chatInput");

    let selectedColor = "#ffffff"; // Default boja

    // Funkcija za primenu stila na tekst
    function applyStyle(style) {
        const currentText = chatInput.value;
        chatInput.value = `<${style}>${currentText}</${style}>`;
    }

    // Bold dugme
    boldBtn.addEventListener("click", () => {
        applyStyle("b");
    });

    // Italic dugme
    italicBtn.addEventListener("click", () => {
        applyStyle("i");
    });

    // Boja dugme
    colorBtn.addEventListener("click", () => {
        colorPicker.click();
    });

    // Kada se odabere boja
    colorPicker.addEventListener("input", (event) => {
        selectedColor = event.target.value;
        chatInput.style.color = selectedColor; // Postavi boju unosa

        // Takođe, možemo postaviti boju i na poruke
        const messages = document.querySelectorAll(".message");
        messages.forEach(msg => {
            msg.style.color = selectedColor;
        });
    });

    // Slanje poruke kada korisnik pritisne enter
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const message = chatInput.value;
            socket.emit("chatMessage", { text: message, color: selectedColor });

            // Očisti polje za unos
            chatInput.value = "";
        }
    });

    // Dodajemo funkciju za prikaz poruke
    socket.on("chatMessage", (msgData) => {
        const messageArea = document.getElementById("messageArea");
        const message = document.createElement("div");
        message.classList.add("message");
        message.innerHTML = `<span style="color:${msgData.color}; font-weight:${msgData.bold ? 'bold' : 'normal'}; font-style:${msgData.italic ? 'italic' : 'normal'}">${msgData.nickname}: ${msgData.text}</span>`;
        messageArea.appendChild(message);
    });

    // Funkcija za dodavanje nikname
    socket.on("updateGuestList", (guests) => {
        const guestList = document.getElementById("guestList");
        guestList.innerHTML = ''; // Očisti listu
        guests.forEach(guest => {
            const guestDiv = document.createElement("div");
            guestDiv.classList.add("guest");
            guestDiv.textContent = guest.nickname;
            guestDiv.style.color = guest.color; // Postavi boju nickna
            guestList.appendChild(guestDiv);
        });
    });
});
