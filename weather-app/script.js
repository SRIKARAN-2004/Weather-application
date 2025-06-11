const apiKey = 'f77252d1795d3e79c9241922a013e351'; // Your OpenWeatherMap API key

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) return alert('Please enter a city name');

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const description = data.weather[0].description;
    const temp = data.main.temp;
    const date = new Date();

    document.getElementById('location').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('temp').innerText = `🌡 Temperature: ${temp}°C`;
    document.getElementById('description').innerText = `🌀 ${description}`;
    document.getElementById('humidity').innerText = `💧 Humidity: ${data.main.humidity}%`;
    document.getElementById('datetime').innerText = `🕒 Local Time: ${date.toLocaleTimeString()} - ${date.toDateString()}`;

    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    document.getElementById('weatherCard').style.display = 'block';

    changeBackground(description);
    giveSuggestion(description, temp);

  } catch (error) {
    alert('City not found!');
    document.getElementById('weatherCard').style.display = 'none';
    document.body.className = "";
  }
}

function changeBackground(desc) {
  document.body.className = "";

  if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("thunderstorm")) {
    document.body.classList.add("rain");
  } else if (desc.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (desc.includes("clear") || desc.includes("sun")) {
    document.body.classList.add("sunny");
  } else {
    document.body.style.background = "linear-gradient(to right, #0f2027, #203a43, #2c5364)";
  }
}

function giveSuggestion(desc, temp) {
  let suggestion = "";

  if (desc.includes("rain")) {
    suggestion = "🌧 It’s raining. Carry an umbrella and avoid outdoor plans.";
  } else if (desc.includes("clear") || desc.includes("sun")) {
    if (temp > 30) {
      suggestion = "☀️ It's sunny and hot. Wear light clothes and stay hydrated.";
    } else {
      suggestion = "☀️ Clear skies! Great time to go for a walk or outdoor activities.";
    }
  } else if (desc.includes("cloud")) {
    suggestion = "☁️ Cloudy weather. Might be a good day for indoor activities.";
  } else if (desc.includes("snow")) {
    suggestion = "❄️ It's snowy. Wear warm clothes and be cautious outside.";
  } else {
    suggestion = "🌍 Weather seems calm. Plan your day as usual.";
  }

  document.getElementById('suggestion').innerText = suggestion;

  speakWeatherInfo(temp, desc, suggestion);
}

function speakWeatherInfo(temp, desc, suggestion) {
  const synth = window.speechSynthesis;

  const message = `The weather is ${desc}. The temperature is ${temp} degrees Celsius. ${suggestion}`;

  const utter = new SpeechSynthesisUtterance(message);
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = 'en-US';

  synth.cancel();
  synth.speak(utter);
}

function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition. Please try using Google Chrome.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const synth = window.speechSynthesis;
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    synth.speak(utter);
  };

  speak("Listening for city name");

  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('cityInput').value = transcript;

    speak(`You said ${transcript}`);
    getWeather(); 
  };

  recognition.onerror = function(event) {
    speak("Sorry, I couldn't hear you. Please try again.");
    alert('Error occurred in speech recognition: ' + event.error);
  };

  recognition.onspeechend = function() {
    recognition.stop();
  };
}
