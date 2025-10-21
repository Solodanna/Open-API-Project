// show a loading message for weather if the container exists
var weatherContainer = document.getElementById("weather-container");
if (weatherContainer) {
  weatherContainer.innerHTML = '<div class="loading">Loading weather...</div>';
}

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
      var container = document.getElementById("weather-container");
      if (container)
        container.innerHTML =
          '<div class="error">Error rendering weather.</div>';
    }
  })
  .catch((error) => {
    console.error("Error fetching weather data:", error);
    var container = document.getElementById("weather-container");
    if (container)
      container.innerHTML = '<div class="error">Unable to load weather.</div>';
  });
// This code fetches the current weather data for Seattle, WA from the Open-Meteo API
// and logs the temperature and weather condition code to the console.

/*
  Improvements:
  - Modular functions for fetch/render logic
  - Loading and error UI shown to users (aria-live="polite")
  - Accessible artwork image alt text and keyboard-focusable image
  - "Show another artwork" button (keyboard accessible)
  - Friendly messages on errors
*/

function setLoading(container, message = "Loading...") {
  if (!container) return;
  container.innerHTML = `<div class="loading" role="status" aria-live="polite">${message}</div>`;
}

function setError(container, message = "Something went wrong.") {
  if (!container) return;
  container.innerHTML = `<div class="error" role="alert">${message}</div>`;
}

function renderWeather(container, w) {
  if (!container || !w) return;
  container.innerHTML = `
    <div class="card" aria-live="polite">
      <h3>Current Weather</h3>
      <p>Temperature: ${w.temperature}°C</p>
      <p>Wind speed: ${w.windspeed} km/h</p>
      <p>Time: ${w.time}</p>
    </div>
  `;
  // accessibility: make container programmatically focusable and expose as a region
  container.setAttribute("tabindex", "-1");
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", "Current weather");
  container.focus();
}

async function fetchWeather() {
  const container = document.getElementById("weather-container");
  if (!container) return;
  setLoading(container, "Loading weather...");
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=47.61&longitude=-122.33&current_weather=true"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.current_weather) {
      renderWeather(container, data.current_weather);
      console.log("Temperature:", data.current_weather.temperature);
      console.log("Weather Condition:", data.current_weather.weathercode);
    } else {
      setError(container, "Weather data is unavailable.");
    }
  } catch (e) {
    console.error("Error fetching weather data:", e);
    setError(container, "Unable to load weather. Please try again later.");
  }
}

// Artwork functions
let totalArtworks = null;

async function getTotalArtworks() {
  if (totalArtworks !== null) return totalArtworks;
  const res = await fetch(
    "https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=0"
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  totalArtworks = data.pagination?.total || 0;
  return totalArtworks;
}

function renderArtworkCard(container, artwork, iiifBase) {
  if (!container || !artwork) return;
  const imageUrl = artwork.image_id
    ? `${iiifBase}/${artwork.image_id}/full/843,/0/default.jpg`
    : null;
  const artist = artwork.artist_display ? ` — ${artwork.artist_display}` : "";
  const altText = artwork.title
    ? `Artwork: ${artwork.title}${artist}`
    : "Artwork image";

  container.innerHTML = `
    <div class="card" aria-live="polite">
      <h2>${escapeHtml(artwork.title || "Untitled")}</h2>
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${escapeHtml(
              altText
            )}" tabindex="0" />`
          : "<p>No image available.</p>"
      }
      <div style="margin-top:10px;">
        <button id="refresh-artwork" type="button" class="btn" aria-label="Load another artwork">Show another artwork</button>
      </div>
    </div>
  `;

  // accessibility: make container programmatically focusable and expose as a region
  container.setAttribute("tabindex", "-1");
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", artwork.title || "Artwork");

  const btn = document.getElementById("refresh-artwork");
  if (btn) btn.addEventListener("click", showRandomArtwork);

  // move focus to container so screen readers announce new content
  container.focus();
}

function escapeHtml(text = "") {
  return text.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

async function showRandomArtwork() {
  const container = document.getElementById("artwork");
  if (!container) return;
  setLoading(container, "Loading artwork...");
  try {
    const total = await getTotalArtworks();
    if (!total) {
      setError(container, "No public-domain artworks found.");
      return;
    }
    // page index between 1 and total
    const randomPage = Math.floor(Math.random() * total) + 1;
    const artworkRes = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${randomPage}&limit=1&fields=id,title,image_id`
    );
    if (!artworkRes.ok) throw new Error(`HTTP ${artworkRes.status}`);
    const artworkData = await artworkRes.json();
    const artwork = artworkData.data?.[0];
    const iiifBase =
      artworkData.config?.iiif_url || "https://www.artic.edu/iiif/2";
    if (!artwork) {
      setError(container, "No artwork found on this page. Try again.");
      return;
    }
    renderArtworkCard(container, artwork, iiifBase);
  } catch (e) {
    console.error("Error fetching artwork:", e);
    setError(container, "Error fetching artwork. Please try again.");
  }
}

// --- New: UI toggling and event listeners --- //

// Replace the previous DOMContentLoaded-only attachment with a robust init
function initUI() {
  const btnWeather = document.getElementById("btn-weather");
  const btnArtwork = document.getElementById("btn-artwork");

  if (btnWeather)
    btnWeather.addEventListener("click", () => {
      showSection("weather");
    });

  if (btnArtwork)
    btnArtwork.addEventListener("click", () => {
      showSection("artwork");
    });

  // keyboard support: left/right arrows to switch
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const weatherSelected =
        document
          .getElementById("btn-weather")
          ?.getAttribute("aria-selected") === "true";
      // Arrow keys toggle between sections
      if (e.key === "ArrowLeft")
        showSection(weatherSelected ? "artwork" : "weather");
      if (e.key === "ArrowRight")
        showSection(weatherSelected ? "artwork" : "weather");
    }
  });

  // show initial section
  showSection("weather");
}

function setTabSelected(btn, selected) {
  if (!btn) return;
  btn.setAttribute("aria-selected", selected ? "true" : "false");
  if (selected) btn.classList.add("active");
  else btn.classList.remove("active");
}

function showSection(name) {
  const weatherEl = document.getElementById("weather-container");
  const artworkEl = document.getElementById("artwork");
  const btnWeather = document.getElementById("btn-weather");
  const btnArtwork = document.getElementById("btn-artwork");

  if (name === "artwork") {
    if (weatherEl) weatherEl.hidden = true;
    if (artworkEl) artworkEl.hidden = false;
    setTabSelected(btnWeather, false);
    setTabSelected(btnArtwork, true);
    // fetch artwork when requested
    showRandomArtwork();
  } else {
    // default to weather
    if (artworkEl) artworkEl.hidden = true;
    if (weatherEl) weatherEl.hidden = false;
    setTabSelected(btnWeather, true);
    setTabSelected(btnArtwork, false);
    // fetch weather when requested
    fetchWeather();
  }
}

// If the document is still loading wait for DOMContentLoaded, otherwise init now.
// This ensures the script works whether it's loaded in <head> or at end of <body>.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
