const API_URL = "https://api.tarkov.dev/graphql";

const search_input = document.getElementById("searchInput");
const favorite_btn = document.getElementById("favoriteBtn");

search_input.addEventListener("input", update_fav);

// ── LocalStorage helpers ──────────────────────────────────────────────────────

function get_fav() {
    return JSON.parse(localStorage.getItem("favoris")) || [];
}

function save_fav(favs) {
    localStorage.setItem("favoris", JSON.stringify(favs));
}

// ── Favorite button (☆ / ★) ───────────────────────────────────────────────────

function update_fav() {
    const value = search_input.value.trim();
    const favorites = get_fav();

    if (value === "") {
        favorite_btn.textContent = "☆";
        favorite_btn.disabled = true;
        favorite_btn.style.backgroundColor = "";   // retour couleur CSS par défaut (gris)
        return;
    }

    favorite_btn.disabled = false;
    favorite_btn.style.backgroundColor = "var(--color-gold-two)";

    if (favorites.includes(value)) {
        favorite_btn.textContent = "★";
    } else {
        favorite_btn.textContent = "☆";
    }
}

function toggle_fav() {
    const value = search_input.value.trim();
    if (!value) return;

    let favorites = get_fav();

    if (favorites.includes(value)) {
        if (confirm("Supprimer ce favori ?")) {
            favorites = favorites.filter(f => f !== value);
            save_fav(favorites);
        }
    } else {
        // Pas de doublon
        if (!favorites.includes(value)) {
            favorites.push(value);
            save_fav(favorites);
        }
    }

    update_fav();
    display_favorites();
}

// ── Favorites list (navbar) ───────────────────────────────────────────────────

function display_favorites() {
    const favorites = get_fav();
    let container = document.getElementById("favoritesPanel");

    // Création du panneau s'il n'existe pas encore
    if (!container) {
        container = document.createElement("div");
        container.id = "favoritesPanel";
        container.className = "favorites-panel";
        // Insérer juste après le header
        document.querySelector("header").insertAdjacentElement("afterend", container);
    }

    if (favorites.length === 0) {
        container.innerHTML = '<p class="no-fav">(Aucune recherche favorite)</p>';
        return;
    }

    const items = favorites.map(fav => `
        <span class="fav-item">
            <span class="fav-name" onclick="load_fav('${CSS.escape(fav)}')">${fav}</span>
            <button class="fav-remove" onclick="remove_fav('${CSS.escape(fav)}')" title="Supprimer">⨷</button>
        </span>
    `).join("");

    container.innerHTML = `<div class="fav-list">${items}</div>`;
}

function load_fav(name) {
    // Décode les caractères éventuellement échappés par CSS.escape
    const decoded = name;
    search_input.value = decoded;
    update_fav();
    search();
}

function remove_fav(name) {
    if (confirm("Supprimer ce favori ?")) {
        let favorites = get_fav();
        favorites = favorites.filter(f => f !== name);
        save_fav(favorites);
        // Si le champ correspond à ce favori, mettre à jour le bouton
        if (search_input.value.trim() === name) {
            update_fav();
        }
        display_favorites();
    }
}

// ── Search & display ──────────────────────────────────────────────────────────

function search() {
    const query = search_input.value.trim();
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

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    update_fav();
    display_favorites();
});