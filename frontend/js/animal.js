const API_URL = 'https://virtual-zoo-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
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

    const urlParams = new URLSearchParams(window.location.search);
    const animalName = urlParams.get('name');

    if (!animalName) {
        document.getElementById('detailContainer').innerHTML = '<h2>Animal not found</h2>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/animals/${encodeURIComponent(animalName)}`);

        if (res.status === 404) {
            document.getElementById('detailContainer').innerHTML = '<h2>Animal not found</h2>';
            return;
        }

        const animal = await res.json();
        renderAnimalDetails(animal);
    } catch (err) {
        document.getElementById('detailContainer').innerHTML = '<p>Error loading details.</p>';
        console.error(err);
    }
});

function renderAnimalDetails(animal) {
    const container = document.getElementById('detailContainer');

    // Process images
    const placeholder = `https://placehold.co/400x300?text=${encodeURIComponent(animal.name)}`;
    const fallbackImage = animal.image || placeholder;
    const gallery = animal.gallery && animal.gallery.length >= 3 ? animal.gallery : [
        fallbackImage, fallbackImage, fallbackImage
    ];
    const mainImg = gallery[0];
    const galleryImgs = gallery.slice(0, 3);

    // Check if favorited
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isFav = Array.isArray(user.favorites) ? user.favorites.includes(animal.name) : false;

    let funFactsHTML = '';
    if (animal.funFacts && animal.funFacts.length > 0) {
        funFactsHTML = `
            <div class="fun-facts">
                <h3 style="font-size: 1.8rem; margin-bottom: 1rem;">Fun Facts</h3>
                <ul>
                    ${animal.funFacts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="detail-layout">
            <div class="detail-img-wrapper">
                <img src="${mainImg}" alt="${animal.name}" class="detail-main-img">
            </div>
            <div class="detail-info">
                <div class="pill-container">
                    <span class="pill green">${animal.category || 'Animal'}</span>
                    <span class="pill orange">${animal.status || 'Unknown'}</span>
                </div>
                
                <h1 class="detail-name">${animal.name}</h1>
                <p class="detail-scientific">${animal.scientificName || 'Scientific Name'}</p>
                
                <p class="detail-desc">${animal.description || ''}</p>
                
                <div class="action-btns">
                    <button class="btn btn-primary" id="favBtn" style="background-color: ${isFav ? '#e65100' : 'var(--primary-color)'}">
                        ${isFav ? '❤️ Remove Favorite' : '❤️ Favorite'}
                    </button>
                    <button class="btn" style="border: 1px solid #ccc;">🔖 Bookmark</button>
                </div>
            </div>
        </div>

        <div class="info-cards">
            <div class="info-card">
                <h4>Habitat</h4>
                <p>${animal.habitat || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>Diet</h4>
                <p>${animal.diet || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>Lifespan</h4>
                <p>${animal.lifespan || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>Speed</h4>
                <p>${animal.speed || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>Size</h4>
                <p>${animal.size || 'N/A'}</p>
            </div>
        </div>

        <div class="gallery-section animate-fade-up">
            <h2 class="section-title">Gallery</h2>
            <div class="gallery-grid">
                ${galleryImgs.map(img => `<div class="gallery-item"><img src="${img}" alt="${animal.name} gallery image"></div>`).join('')}
            </div>
        </div>

        ${funFactsHTML}
    `;

    // Handle favorite
    const favBtn = document.getElementById('favBtn');
    favBtn.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ animalName: animal.name })
            });

            if (res.ok) {
                const updatedFavorites = await res.json();
                user.favorites = updatedFavorites;
                localStorage.setItem('user', JSON.stringify(user));

                const nowFav = updatedFavorites.includes(animal.name);
                favBtn.innerHTML = nowFav ? '❤️ Remove Favorite' : '❤️ Favorite';
                favBtn.style.backgroundColor = nowFav ? '#e65100' : 'var(--primary-color)';
            }
        } catch (err) {
            console.error('Error toggling favorite', err);
        }
    });
}
