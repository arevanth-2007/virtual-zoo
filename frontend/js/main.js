const API_URL = 'https://virtual-zoo-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    let isExpired = true;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            isExpired = payload.exp * 1000 < Date.now();
        } catch (e) { }
    }

    if (!token || isExpired) {
        if (isExpired && token) alert('Session expired, please login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    const animalGrid = document.getElementById('animalGrid');
    
    let showingFavorites = false;
    const favoritesLink = document.getElementById('favoritesLink');
    favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showingFavorites = !showingFavorites;
        favoritesLink.textContent = showingFavorites ? 'All Animals' : 'Favorites';
        fetchAnimals();
    });

    async function fetchAnimals() {
        try {
            animalGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Loading animals...</p>';
            
            const res = await fetch(`${API_URL}/animals`);
            let animals = await res.json();
            
            if (showingFavorites) {
                const userObj = JSON.parse(localStorage.getItem('user'));
                const userFavorites = userObj.favorites || [];
                animals = animals.filter(a => userFavorites.includes(a.name));
            }

            renderAnimals(animals);
        } catch (err) {
            animalGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Error loading animals. Is the backend running?</p>';
            console.error(err);
        }
    }

    function renderAnimals(animals) {
        animalGrid.innerHTML = '';
        if (animals.length === 0) {
            animalGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No animals found.</p>';
            return;
        }

        animals.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Image fallback logic
            const placeholder = `https://placehold.co/400x300?text=${encodeURIComponent(animal.name)}`;
            const imgSrc = animal.image ? animal.image : placeholder;
            
            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${imgSrc}" alt="${animal.name}" class="card-img" onerror="this.src='${placeholder}';">
                </div>
                <div class="card-body">
                    <h3 class="card-title">
                        ${animal.name}
                        <span class="icon">➔</span>
                    </h3>
                </div>
            `;
            
            card.addEventListener('click', () => {
                window.location.href = `animal.html?name=${encodeURIComponent(animal.name)}`;
            });
            
            animalGrid.appendChild(card);
        });
    }

    fetchAnimals();
});
