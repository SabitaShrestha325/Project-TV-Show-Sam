let allEpisodes = []; // make global variable to store all episodes
//You can edit ALL of the code here

//Moving window.onload to top to fetch episodes from the API once when the page loads
window.onload = () => {
  //To show a loading message while the fetch is in progress
  document.getElementById("root").innerHTML = "<p>Loading episodes...</p>";

  //Fetching all episode data from the TVmaze API
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        //To throw an error if the response status is not OK
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); //Parse the JSON from the response
    })
    .then((data) => {
      allEpisodes = data; //To store the fetched episodes globally
      makePageForEpisodes(allEpisodes); // fill dropdown
      setupSearch(); // Setup search functionality
      setupSelector(); // Setup episode selector functionality
      populateEpisodeSelector(allEpisodes);
    })
    .catch((error) => {
      // show a user-friendly error message if the fetch fails
      document.getElementById("root").innerHTML =
        "<p style='color: pink;'>Failed to load episodes. Please try again later.</p>";
      console.error("Error fetching episodes:", error);
    });
};

//The setup() function was only useful when using static data.
// Now that the data comes from an asynchronous fetch request,s the function is no longer needed.

// function setup() {
//   allEpisodes = getAllEpisodes(); // now assigned to the global variable
//   setupSearch(); // Setup search functionality
//   setupSelector(); // Setup episode selector functionality
//   populateEpisodeSelector(allEpisodes);
//   makePageForEpisodes(allEpisodes); // fill dropdown
// }

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  // Using .map() to generate episode cards and return them as an array
  const episodeCards = episodeList.map(function (episode) {
    // Creating the episode card container
    const episodeCard = document.createElement("div");
    episodeCard.classList.add("episode-card"); // Add class for styling later

    //Formatting the episode code (S01E01)
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    //Creating the episode title
    const title = document.createElement("h2");
    title.textContent = `${episodeCode} - ${episode.name}`;

    //Creating the episode image
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `${episode.name} image`;

    //Adding the episode summary
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary; // Note: HTML content will remain, like <p> tags.

    //Creating the link to the TVmaze page for this episode
    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVmaze";
    link.target = "_blank"; // Open the link in a new tab

    //Appending the elements to the episode card
    episodeCard.append(title, image, summary, link);
    return episodeCard; //Return the card to be used in the map function
  });

  //Appending all episode cards to the root element
  rootElem.append(...episodeCards); // Using the spread operator to append all cards at once

  updateSearchCount(episodeList.length, allEpisodes.length); //update the search results count
}

// This function will set up live search bar functionality
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
      );
    });
    makePageForEpisodes(filtered);
  });
}

// This function will update the text that shows how many episodes are currently  displayed
function updateSearchCount(current, total) {
  const searchCount = document.getElementById("searchCount");
  searchCount.textContent = `Displaying ${current} / ${total} episodes`;
}
// This function populates a select dropdown with episode options
// It uses the episode data to create options for each episode
function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");

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
// This function sets up the functionality from the dropdown selector
// when user selects an episode, it will display only that episode
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
