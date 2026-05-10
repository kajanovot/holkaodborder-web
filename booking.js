// Přidáme debugovací výpisy
console.log('Booking.js načten');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM načten, inicializuji kalendář');
    
    try {
        const calendar = flatpickr("#booking-calendar", {
            locale: 'cs',
            dateFormat: "d.m.Y",
            minDate: "today",
            inline: true, // Přidáme inline režim pro vždy viditelný kalendář
            disable: [
                function(date) {
                    // Disable weekends
                    return date.getDay() === 0;
                }
            ],
            onChange: function(selectedDates, dateStr) {
                console.log('Datum vybráno:', dateStr);
                document.getElementById('selected-date').textContent = dateStr;
                generateTimeSlots(selectedDates[0]);
            }
        });
        
        console.log('Kalendář inicializován');
    } catch (error) {
        console.error('Chyba při inicializaci kalendáře:', error);
    }

    function generateTimeSlots(date) {
        const slotsContainer = document.querySelector('.slots-grid');
        slotsContainer.innerHTML = '';
        
        const timeSlots = [
            "9:00", "10:00", "11:00", "13:00", 
            "14:00", "15:00", "16:00", "17:00"
        ];

        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                document.getElementById('selected-time').textContent = time;
                document.getElementById('selected-datetime').value = `${date.toLocaleDateString('cs-CZ')} ${time}`;
            });
            
            slotsContainer.appendChild(slot);
        });
    }

    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the data to your server
        const formData = {
            datetime: document.getElementById('selected-datetime').value,
            trainingType: document.getElementById('training-type').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dogInfo: document.getElementById('dog-info').value
        };

        // For now, just show an alert
        alert('Rezervace byla úspěšně odeslána!\nBudeme Vás kontaktovat pro potvrzení termínu.');
        
        // Reset form
        this.reset();
        document.getElementById('selected-date').textContent = 'Nevybráno';
        document.getElementById('selected-time').textContent = 'Nevybráno';
    });
});
