const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("searchInput");

let games = [];

fetch("games.json")
  .then(response => response.json())
  .then(data => {
    games = data;
    displayGames(games);
  })
  .catch(error => {
    console.error("Failed to load games.json:", error);
    gameGrid.innerHTML = `<p class="empty-message">Could not load games.</p>`;
  });

function getGameFolder(path) {
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function getFolderName(path) {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 2] || "";
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setAutoLogo(imgElement, game) {
  const folder = getGameFolder(game.path);
  const folderName = getFolderName(game.path);
  const titleSlug = slugify(game.title);

  const possibleNames = [
    "logo",
    "icon",
    "thumbnail",
    "thumb",
    "cover",
    "preview",
    "image",
    "banner",
    "poster",
    "game",
    folderName,
    titleSlug
  ];

  const possibleExtensions = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "svg",
    "gif"
  ];

  let possibleImages = [];

  possibleNames.forEach(name => {
    possibleExtensions.forEach(ext => {
      possibleImages.push(`${folder}${name}.${ext}`);
    });
  });

  // If you manually set an image in games.json, it will try that first.
  if (game.image) {
    possibleImages.unshift(game.image);
  }

  let imageIndex = 0;

  imgElement.src = possibleImages[imageIndex];

  imgElement.onerror = () => {
    imageIndex++;

    if (imageIndex < possibleImages.length) {
      imgElement.src = possibleImages[imageIndex];
    } else {
      imgElement.src = "images/game-thumbnail.png";
      imgElement.onerror = null;
    }
  };
}

function displayGames(gameList) {
  gameGrid.innerHTML = "";

  if (gameList.length === 0) {
    gameGrid.innerHTML = `<p class="empty-message">No games found.</p>`;
    return;
  }

  gameList.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const image = document.createElement("img");
    image.alt = game.title;

    setAutoLogo(image, game);

    const content = document.createElement("div");
    content.className = "game-card-content";

    content.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description}</p>
    `;

    card.appendChild(image);
    card.appendChild(content);

    card.addEventListener("click", () => {
      window.location.href = `play.html?game=${encodeURIComponent(game.path)}`;
    });

    gameGrid.appendChild(card);
  });
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  const filteredGames = games.filter(game => {
    const titleMatch = game.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = game.description.toLowerCase().includes(searchTerm);
    const tagMatch = game.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    return titleMatch || descriptionMatch || tagMatch;
  });

  displayGames(filteredGames);
});