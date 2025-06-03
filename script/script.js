const formCity = document.getElementById("formCity")
const inputCity = document.getElementById("inputCity");
const buttonCity = document.getElementById("buttonCity");
const cityName = document.getElementById("showCityName");
const currentIcon = document.getElementById("currentIcon");
const description = document.getElementById("description")
const currentTemp = document.getElementById("currentTemp")
const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const upcomingForecast = document.getElementById("upcomingForecast")

const apiKey = "b8f8bb55996a364c892c200d55ad5795";

function loadingInformations(forecasts) {


    upcomingForecast.innerHTML = '';
    let forecastHTML = '';
    for (let i = 0; i < forecasts.length; i++) {
        if (i === 0) {
            // Aqui puxa as informações do Card Principal
            const currentIconUrl = `http://openweathermap.org/img/wn/${forecasts[0].icon}@2x.png`
            cityName.textContent = forecasts[0].city;
            currentIcon.src = currentIconUrl
            description.textContent = forecasts[0].description;
            currentTemp.textContent = `${forecasts[0].temp}°`
            feelsLike.textContent = `${forecasts[0].feelsLike}°`
            windSpeed.textContent = `${forecasts[0].windSpeed} m/s`
            humidity.textContent = `${forecasts[0].humidity}%`
        } else {
            // Aqui gera dinamicamente a previsão de tempo
            const iconUrl = `http://openweathermap.org/img/wn/${forecasts[i].icon}@2x.png`

            forecastHTML += `<div
                    class="grid grid-cols-3 p-2 gap-5 sm:p-5 sm:flex sm:flex-col h-[55%] w-[85%] bg-white rounded-3xl shadow-xl items-center ">
                    <p class="pl-2 sm:pl-0 font-semibold">${forecasts[i].date}</p>
                    <img src="${iconUrl}" alt="" class="w-8 sm:w-25">
                    <p>${forecasts[i].temp}°</p>
                </div>`
        }

    }
    upcomingForecast.innerHTML = forecastHTML;
}

// Aqui eu verifico se tem algo no localStorage
const storageForecast = localStorage.getItem("forecast");

if (storageForecast) {
    const parsedForecast = JSON.parse(storageForecast);
    loadingInformations(parsedForecast)
}


formCity.addEventListener('submit', async (event) => {
    event.preventDefault();
    let lon, lat;
    const city = inputCity.value.trim()
    if (!city) {
        alert(`Digite o nome de uma cidade`);
        return
    }
    // Aqui eu faço um Fetch pra Api Geocoding, preciso dela por conta que a outra API nao aceita nome de cidade.
    const urlApi = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${1}&appid=${apiKey}`
    try {
        const response = await fetch(urlApi)
        const resolve = await response.json()

        if (!response.ok) {
            throw new Error(`ERROR: ${resolve.message}`)
        }
        if (resolve.length === 0) {
            throw new Error(`Cidade "${city}" não encontrada.`);
        }

        lon = resolve[0].lon;
        lat = resolve[0].lat;

    } catch (error) {
        alert(error);
        return;
    }
    // Fetch da Api OpenWeather
    const urlApi2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;

    try {
        const response2 = await fetch(urlApi2)
        const resolve2 = await response2.json()

        if (!response2.ok) {
            throw new Error(`ERROR: ${resolve2.message}`)
        }

        let forecast = [];
        for (let i = 0; i < 5; i++) {
            const day = resolve2.list[i * 8]; // pula de 8 em 8 lista, a API faz 1 lista a cada 3horas, entao isso checa 24horas na frente.
            const timestamp = day.dt;
            const date = new Date(timestamp * 1000);
            const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);

            forecast.push({
                city: resolve2.city.name,
                date: weekday,
                temp: parseInt(day.main.temp),
                feelsLike: parseInt(day.main.feels_like),
                icon: day.weather[0].icon,
                description: day.weather[0].description,
                humidity: day.main.humidity,
                windSpeed: day.wind.speed

            });
        }
        // Salvo no localStorage
        localStorage.setItem('forecast', JSON.stringify(forecast));
        loadingInformations(forecast)
    } catch (error) {
        alert(error)
    }
})


