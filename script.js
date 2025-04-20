let allEpisodes = [];
const episodeCache = {};
const showCache = {};
let isShowingEpisodes = false;
let currentView = "shows";

window.onload = () => {
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading shows...</p>";

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      allShows = shows;
      shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      populateShowDropdown(shows);
      displayAllShows(shows);
      setupSearch();
    })
    .catch((err) => {
      console.error("Failed to fetch shows list:", err);
      root.innerHTML =
        "<p style='color: pink;'>Failed to load shows. Please try again later.</p>";
    });
};

function loadShowEpisodes(showId) {
  currentView = "episodes";
  toggleViewElements();
  isShowingEpisodes = true;
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading episodes...</p>";

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    displayEpisodes(allEpisodes);
  } else {
    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((episodes) => {
        episodeCache[showId] = episodes;
        allEpisodes = episodes;
        displayEpisodes(allEpisodes);
        clearSearchBar();
      })
      .catch((err) => {
        root.innerHTML =
          "<p style='color: pink;'>Failed to load episodes. Please try again later.</p>";
        console.error("Error fetching episodes:", err);
      });
  }
}

function displayEpisodes(episodes) {
  makePageForEpisodes(episodes);
  setupSearch();
  setupSelector();
  populateEpisodeSelector(episodes);
  updateSearchPlaceholder();
}
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  if (episodeList.length === 0) {
    rootElem.innerHTML =
      "<p style='color: pink;'>No matching episodes found.</p>";
    updateSearchCount(0, allEpisodes.length);
    return;
  }
  const episodeCards = episodeList.map(function (episode) {
    const episodeCard = document.createElement("div");
    episodeCard.classList.add("episode-card");

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    const title = document.createElement("h2");
    title.textContent = `${episodeCode} - ${episode.name}`;

    const image = document.createElement("img");
    image.src =
      episode.image?.medium ||
      "https://user-images.githubusercontent.com/47315479/81145216-7fbd8700-8f7e-11ea-9d49-bd5fb4a888f1.png"; // Placeholder if image fails to load
    image.alt = `${episode.name} image`;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVmaze";
    link.target = "_blank";

    episodeCard.append(title, image, summary, link);
    return episodeCard;
  });

  rootElem.append(...episodeCards);

  updateSearchCount(episodeList.length, allEpisodes.length);
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    if (isShowingEpisodes) {
      const filtered = allEpisodes.filter((ep) => {
        return (
          ep.name.toLowerCase().includes(term) ||
          ep.summary.toLowerCase().includes(term)
        );
      });
      makePageForEpisodes(filtered);
    } else {
      const filtered = allShows.filter((show) => {
        return (
          show.name.toLowerCase().includes(term) ||
          (show.summary && show.summary.toLowerCase().includes(term)) ||
          show.genres.some((genre) => genre.toLowerCase().includes(term))
        );
      });
      displayAllShows(filtered);
    }
  });
}

function updateSearchCount(current, total, type = "episodes") {
  const searchCount = document.getElementById("searchCount");
  searchCount.textContent = `Displaying ${current} / ${total} episodes`;
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = `<option value="all">All Episodes</option>`; // reset first

  episodes.forEach((ep, index) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${code} - ${ep.name}`;
    selector.appendChild(option);
  });
}

function setupSelector() {
  const selector = document.getElementById("episodeSelector");
  selector.addEventListener("change", (e) => {
    const value = e.target.value;

    if (value === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = [allEpisodes[parseInt(value)]];
      makePageForEpisodes(selectedEpisode);
    }
  });
}

function populateShowDropdown(shows) {
  const dropdown = document.getElementById("showSelector");
  dropdown.innerHTML = "";

  const allShowsOption = document.createElement("option");
  allShowsOption.value = "all";
  allShowsOption.textContent = "All Shows";
  dropdown.appendChild(allShowsOption);

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", (e) => {
    const showId = e.target.value;
    if (showId === "all") {
      displayAllShows(shows);
    } else if (showId) {
      loadShowEpisodes(showId);
    }
  });
}

function displayAllShows(showList) {
  currentView = "shows";
  toggleViewElements();
  isShowingEpisodes = false;
  const root = document.getElementById("root");
  root.innerHTML = "";

  document.getElementById("showSelector").value = "all";
  document.getElementById("episodeSelector").value = "all";

  const searchCount = document.getElementById("searchCount");
  searchCount.textContent = `Displaying ${showList.length} / ${allShows.length} shows`;

  const showCards = showList.map((show) => {
    const card = document.createElement("div");
    card.classList.add("show-card");

    const title = document.createElement("h2");
    title.textContent = show.name;
    title.classList.add("clickable-title");

    title.addEventListener("click", () => {
      document.getElementById("showSelector").value = show.id;
      loadShowEpisodes(show.id);
    });

    const image = document.createElement("img");
    image.src =
      show.image?.medium ||
      "https://user-images.githubusercontent.com/47315479/81145216-7fbd8700-8f7e-11ea-9d49-bd5fb4a888f1.png";

    const summary = document.createElement("div");
    summary.innerHTML = show.summary || "<p>No summary available.</p>";

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ")}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating?.average ?? "N/A"}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime} min`;

    const button = document.createElement("button");
    button.textContent = "View Episodes";
    button.addEventListener("click", () => {
      document.getElementById("showSelector").value = show.id;
      loadShowEpisodes(show.id);
    });

    card.append(title, image, summary, genres, status, rating, runtime, button);
    return card;
  });

  root.append(...showCards);
  updateSearchPlaceholder();
}

function updateSearchPlaceholder() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    if (isShowingEpisodes) {
      searchInput.placeholder = "Search Episodes...";
    } else {
      searchInput.placeholder = "Search Shows...";
    }
  }
}
function clearSearchBar() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
  }
}

function toggleViewElements() {
  const navLink = document.getElementById("navLink");
  const episodeSelector = document.getElementById("episodeSelector");
  const showSelector = document.getElementById("showSelector");

  navLink.style.display = currentView === "episodes" ? "block" : "none";
  episodeSelector.style.display = currentView === "episodes" ? "block" : "none";
  showSelector.style.display = currentView === "shows" ? "block" : "none";
}

function returnToShows() {
  displayAllShows(allShows);
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input")); // Trigger search update
}
