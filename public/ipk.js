async function fetchIps() {
    try {
        const response = await fetch('/ip-list');
        if (!response.ok) {
            throw new Error(`Greška pri dohvaćanju IP lista: ${response.statusText}`);
        }
        const ips = await response.json();
        
        const ipContainer = document.getElementById('ip-container');
        ipContainer.innerHTML = ''; // Čistimo stari sadržaj
        
        ips.forEach(ip => {
            const ipElement = document.createElement('div');
            ipElement.style.fontSize = '1.2em'; // Povećan font za lakše čitanje
            ipElement.textContent = `IP: ${ip.ip}, Vreme: ${ip.time}`;
            ipContainer.appendChild(ipElement);
        });
    } catch (error) {
        console.error('Error fetching IP list:', error);
    }
}

async function fetchMessages() {
    try {
        const response = await fetch('/messages');
        if (!response.ok) {
            throw new Error(`Greška pri dohvaćanju poruka: ${response.statusText}`);
        }
        const messages = await response.json();
        
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = ''; // Čistimo stari sadržaj
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.style.fontSize = '1.2em'; // Povećan font za lakše čitanje
            messageElement.textContent = `IP: ${message.ip}, Vreme: ${message.time}, Poruka: ${message.text}`;
            messagesContainer.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Pozivamo funkcije za dohvaćanje podataka pri učitavanju stranice
document.addEventListener('DOMContentLoaded', () => {
    fetchIps();
    fetchMessages();
});
