// Prikazivanje i sakrivanje modala
document.getElementById('colorBtn').addEventListener('click', function () {
    document.getElementById('colorPickerModal').style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('colorPickerModal').style.display = 'none';
});

// Biranje boje iz kvadratića
document.querySelectorAll('.color-box').forEach(box => {
    box.addEventListener('click', function () {
        const selectedColor = this.getAttribute('data-color');
        applyColor(selectedColor);
    });
});

// Biranje boje sa manuelnog color pickera
document.getElementById('manualColorPicker').addEventListener('input', function () {
    applyColor(this.value);
});

document.getElementById('applyColor').addEventListener('click', function () {
    const selectedColor = document.getElementById('manualColorPicker').value;
    applyColor(selectedColor);
});

// Primena boje za korisnika i goste
function applyColor(color) {
    currentColor = color; // Ažuriraj trenutnu boju
    document.getElementById('chatInput').style.color = currentColor; // Primeni na input
    const userElement = document.getElementById(`guest-${userUUID}`);
    if (userElement) {
        userElement.style.color = currentColor; // Primeni na listu gostiju
    }
    document.getElementById('colorPickerModal').style.display = 'none'; // Zatvori modal
}
