//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

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

    // Returning the episode card to be added to the array
    return episodeCard;
  });

  //Appending all episode cards to the root element
  rootElem.append(...episodeCards); // Using the spread operator to append all cards at once
}

window.onload = setup;
