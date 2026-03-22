const API_URL = "https://api.tarkov.dev/graphql";

const search_input = document.getElementById("searchInput");
const favorite_btn = document.getElementById("favoriteBtn");

search_input.addEventListener("input", update_fav);

function get_fav() {
    return JSON.parse(localStorage.getItem("favoris")) || [];
}

function save_fav(favs) {
    localStorage.setItem("favoris", JSON.stringify(favs));
}

function update_fav() {
    const value = search_input.value.trim();
    const favorites = getFavorites();

    if (value === "") {
        favoriteBtn.textContent = "☆";
        favoriteBtn.disabled = true;
        favoriteBtn.style.backgroundColor = "grey";
        return;
    }

    favoriteBtn.disabled = false;

    if (favorites.includes(value)) {
        favoriteBtn.textContent = "★";
    } else {
        favoriteBtn.textContent = "☆";
    }

    favoriteBtn.style.backgroundColor = "var(--color-gold-two)";
}

function toggle_fav() {
    const value = search_input.value.trim();
    if (!value) return;

    let favorites = get_fav();

    if (favorites.includes(value)) {
        if (confirm("Supprimer ce favori ?")) {
            favorites = favorites.filter(f => f !== value);
        }
    } else {
        favorites.push(value);
    }

    saveFavorites(favorites);
    updateFavoriteButton();
    displayFavorites();
}


function search() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                {
                  item(gameMode: regular, lang: en, normalizedName: "${query}") {
                    name
                    avg24hPrice
                    low24hPrice
                    lastLowPrice
                    image512pxLink
                  }
                }
                `
        })
    })
        .then(res => res.json())
        .then(data => display_item(data.data.item))
        .catch(err => console.error(err));
}

function display_item(item) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    if (!item) {
        container.innerHTML = "<p>Aucun item trouvé</p>";
        return;
    }

    const list = document.createElement('div');
    list.className = 'item-list';

    list.innerHTML = `
        <div class="item">
            <div class="item-info">
                <h2>${item.name}</h2>
                <p>Prix moyen (24h): ${item.avg24hPrice}₽</p>
                <p>Prix minimum (24h): ${item.low24hPrice}₽</p>
                <p>Dernier prix bas: ${item.lastLowPrice}₽</p>
            </div>

            <img src="${item.image512pxLink}" width="120">
        </div>
    `;

    container.appendChild(list);
}

