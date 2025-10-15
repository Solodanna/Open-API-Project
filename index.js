fetch(
  "https://api.open-meteo.com/v1/forecast?latitude=47.61&longitude=-122.33&current_weather=true"
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Temperature:", data.current_weather.temperature);
    console.log("Weather Condition:", data.current_weather.weathercode);
    // Beginner-friendly: also show the weather on the page if there's a container
    try {
      var container = document.getElementById("weather-container");
      if (container && data && data.current_weather) {
        var w = data.current_weather;
        container.innerHTML =
          '<div class="card">' +
          "<h3>Current Weather</h3>" +
          "<p>Temperature: " +
          w.temperature +
          "°C</p>" +
          "<p>Wind speed: " +
          w.windspeed +
          " km/h</p>" +
          "<p>Time: " +
          w.time +
          "</p>" +
          "</div>";
      }
    } catch (e) {
      console.error("Error rendering weather to page:", e);
    }
  })
  .catch((error) => console.error("Error fetching weather data:", error));
// This code fetches the current weather data for Seattle, WA from the Open-Meteo API
// and logs the temperature and weather condition code to the console.

async function showRandomArtwork() {
  try {
    // the total number of artworks
    const countRes = await fetch(
      "https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=0"
    );
    const countData = await countRes.json();
    const total = countData.pagination.total;

    // take a random page and fetch one artwork from it
    const randomPage = Math.floor((Math.random() * total) / 1); // 1 artwork per page
    const artworkRes = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${randomPage}&limit=1&fields=id,title,image_id`
    );
    const artworkData = await artworkRes.json();
    const artwork = artworkData.data[0];
    const iiifBase = artworkData.config.iiif_url;

    // Construct image URL
    const imageUrl = `${iiifBase}/${artwork.image_id}/full/843,/0/default.jpg`;

    // Display artwork title and image
    const container = document.getElementById("artwork");
    container.innerHTML = `
      <h2>${artwork.title}</h2>
      <img src="${imageUrl}" alt="${artwork.title}" />
    `;
  } catch (error) {
    console.error("Error fetching artwork:", error);
  }
}

// Call the function on page load
showRandomArtwork();
