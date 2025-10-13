fetch(
  "https://api.open-meteo.com/v1/forecast?latitude=47.61&longitude=-122.33&current_weather=true"
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Temperature:", data.current_weather.temperature);
    console.log("Weather Condition:", data.current_weather.weathercode);
  })
  .catch((error) => console.error("Error fetching weather data:", error));
// This code fetches the current weather data for Seattle, WA from the Open-Meteo API
// and logs the temperature and weather condition code to the console.
