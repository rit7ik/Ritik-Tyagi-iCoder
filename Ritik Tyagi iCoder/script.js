const API_KEY = "PASTE_YOUR_BRAND_NEW_OPENWEATHERMAP_KEY_HERE";
const searchButton = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherAndAQI(city);
    }
});

// --- Helper Functions ---

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    weatherCard.style.display = 'none';
}

function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

function getAQICategory(aqi) {
    
    // OpenWeatherMap AQI Index: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    const categories = {
        1: { name: 'Good', class: 'good' },
        2: { name: 'Fair', class: 'fair' },
        3: { name: 'Moderate', class: 'moderate' },
        4: { name: 'Poor', class: 'poor' },
        5: { name: 'Very Poor', class: 'very-poor' }
    };
    return categories[aqi] || { name: 'N/A', class: '' };
}

// --- Main Fetch Function ---

async function getWeatherAndAQI(city) {
    clearError();
    weatherCard.style.display = 'none';

    try {
        // Use the main endpoint with the city name (This is the most stable test)
        const basicWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        let weatherResponse = await fetch(basicWeatherUrl);

        if (!weatherResponse.ok) {
            // If the key is bad, the status will be 401
            throw new Error(`Weather API failed. Status: ${weatherResponse.status}`);
        }
        const weatherData = await weatherResponse.json();

        // We only have weather data, so pass dummy/empty data for AQI to avoid errors in renderData
        const dummyAqiData = { list: [{ main: { aqi: 0 }, components: { pm2_5: 0, pm10: 0, co: 0, no2: 0, o3: 0 } }] };

        // Note: We cannot get state/country from this basic endpoint, so we pass city name twice.
        renderData(weatherData.name, weatherData.sys.country, weatherData.sys.country, weatherData, dummyAqiData);

    } catch (error) {
        console.error("Fetch error:", error);

        // This message confirms the 401 error is still a key issue
        if (error.message.includes('Status: 401')) {
             displayError("API Key Invalid or Not Active (Status 401). Please check your key or wait a few hours.");
        } else {
             displayError(`An unexpected error occurred: ${error.message}. Check your network.`);
        }
    }
}

// --- DOM Rendering Function ---

function renderData(cityName, state, country, weatherData, aqiData) {
    
    const locationText = state ? `${country}, ${state}` : country;
    const timeStamp = weatherData.dt * 1000;
    const currentTime = new Date(timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    document.getElementById('city-name').textContent = cityName;
    document.getElementById('country-state').textContent = locationText;
    document.getElementById('current-time').textContent = `Local Time: ${currentTime}`;
    
    const tempInCelsius = weatherData.main.temp.toFixed(1);
    document.getElementById('temperature').innerHTML = `${tempInCelsius}°C`;
    
    const condition = weatherData.weather[0].description;
    document.getElementById('condition').textContent = condition.charAt(0).toUpperCase() + condition.slice(1);

    const iconCode = weatherData.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    const aqiEntry = aqiData.list[0];
    const aqiScore = aqiEntry.main.aqi;
    const components = aqiEntry.components;
    
    const aqiInfo = getAQICategory(aqiScore);
    const aqiStatusElement = document.getElementById('aqi-status');
    
    document.getElementById('aqi-score').textContent = aqiScore;
    aqiStatusElement.textContent = aqiInfo.name;
 
    aqiStatusElement.className = 'status-indicator'; 
    aqiStatusElement.classList.add(aqiInfo.class);

    // Air Quality Component Data (in μg/m3 or mg/m3 depending on pollutant)
    document.getElementById('pm25').textContent = components.pm2_5.toFixed(2);
    document.getElementById('pm10').textContent = components.pm10.toFixed(2);
    document.getElementById('co').textContent = components.co.toFixed(2);
    document.getElementById('no2').textContent = components.no2.toFixed(2);
    document.getElementById('o3').textContent = components.o3.toFixed(2);

    weatherCard.style.display = 'block';
}

// --- Initial Load ---

window.onload = () => {
    // This runs a default search when the page loads
    getWeatherAndAQI("New York"); 
};