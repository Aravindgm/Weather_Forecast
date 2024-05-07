//
// Global Variables
//

// Storing the data fetched from the JSON file and making it available globally
let jsonData
// The following varibles are declared so as to control the sorting in the Middle section
const weatherButtonStatus = {
  sunny: true,
  rainy: false,
  snowy: false,
  weatherStatusGlobalVariable: 'sunny'
}
// These are the cities that are to be in the bottom section
const bottomSectionCities = ['auckland', 'kolkata', 'london', 'maseru', 'vienna', 'perth', 'karachi', 'bangkok', 'newyork', 'troll', 'losangeles', 'moscow']
// Maintaining the time and date of all cities
const timerMap = new Map()
// Maintaining the cities that are in the middle section
let timerSet = new Set()
// For revoking current timer event and starting a new event, whenever a new city has been selected
let setTimerId
// The status of continent sort option
let sortedByContinentName = false
// The city that is currently selected in the dropdown at top section
let dropdownCity

/**
 * Invoked function for making some functions to be executed when loading the page
 */
(async function () {
  jsonData = await fetchData()
  populateDropdown()
  setTimer()
  updateTopSection('newyork')
  updateMiddleSection('sunny', 5)
  document.getElementById('sunny').style.borderBottom = '2px solid var(--bg-selection-blue)'
  updateBottomSection(bottomSectionCities)
})()

//
// Event Listeners
//

// Section 1 (Top Section)

// Event Listener for City Dropdown
document.getElementById('city-dropdown').addEventListener('change', function () {
  const selectedCity = this.value.toLowerCase()
  if (!(selectedCity in jsonData)) {
    alert(`'${this.value}' is not available..!\nChoose city names from the available list :)`)
    ariseNilValues()
  } else updateTopSection(selectedCity)
})

// Section 2 (Middle Section)

// Event Listener for right and left scrolling of Middle section using left and right arrow icons
document.getElementById('show-cities-left-arrow').addEventListener('click', function () {
  document.getElementsByClassName('show-cities')[0].scrollBy({
    left: -350,
    behavior: 'smooth'
  })
}) // Left Arrow

document.getElementById('show-cities-right-arrow').addEventListener('click', function () {
  document.getElementsByClassName('show-cities')[0].scrollBy({
    left: 350,
    behavior: 'smooth'
  })
}) // Right Arrow

// Event Listener for Weather icon button --> Sorting the city cards
const weatherButtons = document.getElementsByClassName('weather-select-button')
for (let i = 0; i < 3; i++) {
  weatherButtons[i].addEventListener('click', function () {
    if (!weatherButtonStatus[this.id]) { // Checking if the button is clicked for the first time
      // If clicked again, nothing would be happening

      // Setting back any previously clicked weather Status button
      document.getElementById(weatherButtonStatus.weatherStatusGlobalVariable).style.borderBottom = 'none'
      weatherButtonStatus[weatherButtonStatus.weatherStatusGlobalVariable] = false

      // Setting styles for the respective button that has been clicked
      document.getElementById(this.id).style.borderBottom = '2px solid var(--bg-selection-blue)'
      weatherButtonStatus[this.id] = true
      weatherButtonStatus.weatherStatusGlobalVariable = this.id // Setting the global weather variable as this.id
      updateMiddleSection(this.id, 5)
    }
  })
}

// Windows Event Listener for hiding the arow icon in MiddleSection upon overflow conditions
window.addEventListener('resize', function () {
  hideOrEnableScrollArrow()
})

// Event Listener for the spinner --> Choosing the top cities to be displayed in the middle section
document.getElementById('top-cities-select').addEventListener('change', function () {
  updateMiddleSection(weatherButtonStatus.weatherStatusGlobalVariable, this.value)
})

// Section - 3 (Bottom Section)

// Event Listener for 'continent name sort' option. When clicked the continent wise tiles would be sorted accordingly
document.getElementsByClassName('continent-name-sort')[0].addEventListener('click', function () {
  sortCardsByContinentName()
})

// When the continent names are the same, the temperature variable comes into act. The order of precedence can be configured
document.getElementsByClassName('temp-sort')[0].addEventListener('click', function () {
  sortCardsByTemperature()
})

//
// GeneralFunctions
//

// Section 1 (Top Section)

/**
 * Creating the dropdown
 */
function populateDropdown () {
  const dropdown = document.getElementById('cities')
  for (const city in jsonData) {
    const cityData = jsonData[city]
    dropdown.innerHTML += `<option value="${cityData.cityName}" class="dropdown-options"></option>`
    timerMap.set(cityData.cityName.toLowerCase(), new Date(cityData.dateAndTime))
  }
}

/**
 * Setting up timer and maintaining it for all cities
 * Besides updating the time and date in the middle seciton, the bottom section is also updated
 */
function setTimer () {
  setInterval(function () {
    // Updating the timer for every second
    for (const [, currTime] of timerMap) {
      currTime.setSeconds(currTime.getSeconds() + 1)
    }

    // Setting the timer for all the cards in the middle section
    for (const cities of timerSet) {
      const city = document.getElementById(`city-${cities}`)
      const dateObj = timerMap.get(cities.toLowerCase())
      city.getElementsByClassName('city-time')[0].textContent = dateObj.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' }).toUpperCase()
    }

    // Setting the timer for the bottom section
    for (const city of bottomSectionCities) {
      const gridContainerTimer = document.getElementById(`continent-block-${city}`).getElementsByClassName('city-and-time')[0]
      gridContainerTimer.textContent = `${jsonData[city].cityName}, ${timerMap.get(city).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' }).toUpperCase()}`
    }
  }, 1000)
}

/**
 * Setting the timer for the top section
 */
function updateHeaderTimer () {
  setTimerId = setInterval (function () {
    const currTime = timerMap.get(dropdownCity.toLowerCase())
    const timeHourMins = document.getElementById('time')
    const timesec = document.getElementById('seconds')
    timeHourMins.textContent = String(currTime.getHours() % 12 || 12).padStart(2, '0') + ':' + String(currTime.getMinutes()).padStart(2, '0')
    timesec.textContent = ': ' + String(currTime.getSeconds()).padStart(2, '0')
  }, 1000)
}

/**
 * Function to update the Top Section dynamically
 * @param {String} selectedCity - The city that has been selected in the dropdownor through the cards in the middle section
 */
function updateTopSection (selectedCity) {
  clearInterval(setTimerId) // Clearing out any previous event running the timer for any previously selected city
  const cityData = jsonData[selectedCity]

  document.getElementById('city-icon').innerHTML = `<img src="Assets/HTML & CSS/Icons for cities/${selectedCity}.svg" alt="${selectedCity}" id="icon-resize">`
  document.getElementById('temp-c-val').innerHTML = `<br>&nbsp;${cityData.temperature}`
  document.getElementById('humidity-val').innerHTML = `<br>${cityData.humidity}`
  document.getElementById('temp-f-val').innerHTML = `<br>&nbsp;${celsiusToFahrenheit(cityData.temperature)} F`
  document.getElementById('precipitation-val').innerHTML = `<br>${cityData.precipitation}`
  const dateTimeArray = getDateTime(cityData.dateAndTime.split(' '))
  const currTime = timerMap.get(cityData.cityName.toLowerCase())
  document.getElementById('time').textContent = String(currTime.getHours() % 12 || 12).padStart(2, '0') + ':' + String(currTime.getMinutes()).padStart(2, '0')
  document.getElementById('seconds').textContent = ': ' + String(currTime.getSeconds()).padStart(2, '0')
  if (dateTimeArray[2] === 'AM') {
    document.getElementById('time-des').style.color = '#fdf14a'
    document.getElementById('time-icon').innerHTML = `<img src="Assets/HTML & CSS/General Images & Icons/amState.svg" alt="${'AM'}" id="time-icon-var"></img>`
  } else {
    document.getElementById('time-des').style.color = 'rgb(225, 167, 230)'
    document.getElementById('time-icon').innerHTML = `<img src="Assets/HTML & CSS/General Images & Icons/pmState.svg" alt="${'PM'}" id="time-icon-var"></img>`
  }
  document.getElementById('date').textContent = dateTimeArray[3]
  updateTimeLineDetails(cityData, parseInt(dateTimeArray[4]), dateTimeArray[2]) // dateTimeArray[4] --> Current Time
  document.getElementById('city-dropdown').value = `${cityData.cityName}`
  dropdownCity = cityData.cityName // Setting the global variable 'dropdownCity' to accomodate the currently selected city
  updateHeaderTimer()
}

// Section 2 (Middle Section)

/**
 * Function to update Middle section dynamically
 * @param {String} selectedWeatherButton - The weather button that has been selected in the middle section
 * @param {Number} spinnerLimit - To choose the number of cities that are to be displayed
 */
function updateMiddleSection (selectedWeatherButton, spinnerLimit) {
  timerSet = new Set()
  // Checking the value for the spinnerLimit, and setting it to be only from 3 to 10
  if (spinnerLimit < 3) spinnerLimit = 3
  else if (spinnerLimit > 10) spinnerLimit = 10
  document.getElementById('top-cities-select').value = spinnerLimit

  const sortedCities = sortCities(selectedWeatherButton) // Sorting the cities based upon the property

  let weatherStatus, cityData, dateTimeArray
  let i = 1 // For limiting the number of cities based on spinnerLimit (Display Top Cities -- Value)
  document.getElementsByClassName('show-cities')[0].innerHTML = '' // This is the block in which cards are to be added and displayed

  for (const cities of sortedCities) {
    if (i > spinnerLimit) break // Checking for the spinner value to choose the top 'n'cities to be displayed
    cityData = jsonData[cities.toLowerCase()]

    weatherStatus = getWeatherStatus(parseInt(cityData.temperature), parseInt(cityData.humidity), parseInt(cityData.precipitation))
    weatherStatus = weatherStatus === 'snowy' ? 'snowflake' : weatherStatus
    dateTimeArray = getDateTime(cityData.dateAndTime.split(' '))
    document.getElementsByClassName('show-cities')[0].innerHTML += `<div id="city-${cityData.cityName}" class="display-orientation" onclick="updateTopSection(((this.id).split('-'))[1].toLowerCase())">
      <div class="city-details">
          <div class="city-name">${cityData.cityName}</div>
          <div class="city-temp">
              <div>
                  <img src="Assets/HTML & CSS/Weather Icons/${weatherStatus}Icon.svg" alt="${weatherStatus}" class="weather-icon">
              </div>
              <div class="city-temp-value">${cityData.temperature}</div>
          </div>
      </div>
      <div class="city-time">${timerMap.get(cityData.cityName.toLowerCase()).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' }).toUpperCase()}</div>
      <div class="city-date">${dateTimeArray[3]}</div>
      <div class="city-humidity">
          <div>
              <img src="Assets/HTML & CSS/Weather Icons/humidityIcon.svg" alt="humidity" class="city-humidity-icon">
          </div>
          <div class="city-humidity-value">${cityData.humidity}</div>
      </div>
      <div class="city-precipitation">
          <div>
              <img src="Assets/HTML & CSS/Weather Icons/precipitationIcon.svg" alt="precipitation" class="city-precipitation-icon">
          </div>
          <div class="city-precipitation-value">${cityData.precipitation}</div>
      </div>
      <img src="Assets/HTML & CSS/Icons for cities/${cityData.cityName.toLowerCase()}.svg" alt="${cityData.cityName}" 
      class="display-city-image"></img>
      </div>`
    i++

    if (!timerSet.has(cityData.cityName)) {
      timerSet.add(cityData.cityName)
    } // A 'set' is maintained and updated to contain all the cities in the middle section so as to control the timer
  }
  hideOrEnableScrollArrow() // If contents are overflowing the scroll arrow would be visible
}

// Section - 3 (Bottom Section)

/**
 * Generating the cards in the bottom section
 * @param {Array} bottomSectionCities - Cities that are to be generated as cards in the bottom section
 */
function updateBottomSection (bottomSectionCities) {
  const gridContainer = document.getElementsByClassName('cities-across-continents-grid-container')[0]
  gridContainer.innerHTML = ''
  let cityData
  for (const city of bottomSectionCities) {
    cityData = jsonData[city]
    gridContainer.innerHTML +=
    `<div class="continent-blocks" id="continent-block-${cityData.cityName.toLowerCase()}">
      <div class="continent-name">${cityData.timeZone.split('/')[0]}</div>
      <div class="city-and-time">${cityData.cityName}, ${timerMap.get(city).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' }).toUpperCase()}</div>
      <div class="continent-blocks-temp">${cityData.temperature}</div>
      <div class="continent-blocks-humidity">
          <div class="continent-blocks-humidity-icon">
              <img src="Assets/HTML & CSS/Weather Icons/humidityIcon.svg" alt="humidity" class="continent-blocks-humidity-icon-resize">
          </div>
          <div class="continent-blocks-humidity-value">${cityData.humidity}</div>
      </div>
    </div>`
  }

  // Adding event listener for all the cities
  for (const city of bottomSectionCities) {
    document.getElementById(`continent-block-${city}`).addEventListener('click', function (e) {
      location.href = '#go-top' // Getting navigated to the top section
      updateTopSection(city)
    })
  }
}

/**
 * Sorting the cards based upon the continent name
 */
function sortCardsByContinentName () {
  const continentSortContainer = document.getElementsByClassName('continent-name-sort-img-container')[0]
  const arrow = continentSortContainer.getElementsByTagName('img')[0].alt

  // Changing the direction of the arrow for user visibility
  if (arrow === 'down-arrow') {
    continentSortContainer.innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/arrowUp.svg" alt="up-arrow" class="arrow-configure">'
    sortByContinent('descending')
  } else {
    continentSortContainer.innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/arrowDown.svg" alt="down-arrow" class="arrow-configure">'
    sortByContinent('ascending')
  }
}

/**
 * Sorting the cards based upon the temperature
 * This can be considerd as a utility function for 'continent-wise sorting'. When the continent names are similar this is applied further
 */
function sortCardsByTemperature () {
  const tempSortContainer = document.getElementsByClassName('temp-sort-img-container')[0]
  const arrow = tempSortContainer.getElementsByTagName('img')[0].alt

  // Changing the direction of the arrow for user visibility
  if (arrow === 'down-arrow') {
    tempSortContainer.innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/arrowUp.svg" alt="up-arrow" class="arrow-configure">'
    sortByTemp('descending')
  } else {
    tempSortContainer.innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/arrowDown.svg" alt="down-arrow" class="arrow-configure">'
    sortByTemp('ascending')
  }
}

// Utility Functions

/**
 * Fetching the data from the JSON file
 * @returns {object} - The data fetched from the josn file
 */
async function fetchData () {
  const resp = await fetch('Assets/HTML & CSS/files/data.json')
  const data = resp.json()
  return data
}

// Section 1 (Top Section)

/**
 * Conversion of Celsius to Fahrenheit
 * @param {String} tempInCelsius - Temperature in Celsius
 * @returns {Number} - Temperature in Fahrenheit
 */
function celsiusToFahrenheit (tempInCelsius) {
  const temp = parseInt(tempInCelsius)
  return ((9 / 5) * temp + 32).toFixed(1)
}

/**
 * The dateAndTime attribute is splitted and an array is formatted for further easy usage
 * @param {String} dateAndTime - The date and time together obtained from the json data
 * @returns {Array} - The date and time are formatted into an array
 */
function getDateTime (dateAndTime) {
  const dateTimeArray = []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

  const splitTime = dateAndTime[1].split(':')
  dateTimeArray[0] = splitTime[0].padStart(2, '0') + ':' + splitTime[1] // Time --> Hours and Minutes
  dateTimeArray[1] = ': ' + splitTime[2] // Seconds
  dateTimeArray[2] = dateAndTime[2] // Period --> AM or PM

  const splitDate = dateAndTime[0].split('/')
  dateTimeArray[3] = splitDate[1].padStart(2, '0') + '-' + months[parseInt(splitDate[0])] + '-' + splitDate[2].substring(0, 4) // Date
  dateTimeArray[4] = splitTime[0] // Time --> Only Hours details for further processing in main function

  return dateTimeArray
}

/**
 * The details like time, temperature would be updated for the next five hours
 * @param {Object} cityData - The data of a specific city obtained from the json data
 * @param {Number} currTime - The current time of the respective city
 * @param {String} period - It specifies whether it is AM or PM
 */
function updateTimeLineDetails (cityData, currTime, period) {
  let weatherStatus = getWeatherIcon(cityData.temperature)
  document.getElementById('timeline-temp-1').textContent = cityData.temperature
  document.getElementById('weather-status-icon-1').innerHTML = `<img src="Assets/HTML & CSS/Weather Icons/${weatherStatus}Icon.svg" alt="${weatherStatus}" class="weather-icon-resize"></img>`

  let revisedTime = currTime // updating the time in the time line by increamenting the variable 'revisedTime'
  for (let i = 2; i <= 6; i++) {
    revisedTime++
    if (revisedTime > 12) {
      revisedTime -= 12
    }
    if (revisedTime === 12) {
      if (period === 'AM') period = 'PM'
      else period = 'AM'
    }

    // In the HTML, the timeline had been structured using index from one to six so that
    // ... it could be manipulated here in a loop
    document.getElementById(`timing-${i}`).textContent = revisedTime + ' ' + period
    document.getElementById(`timeline-temp-${i}`).textContent = cityData.nextFiveHrs[i - 2]
    weatherStatus = getWeatherIcon(cityData.nextFiveHrs[i - 2])
    document.getElementById(`weather-status-icon-${i}`).innerHTML = `<img src="Assets/HTML & CSS/Weather Icons/${weatherStatus}Icon.svg" alt="${weatherStatus}" class="weather-icon-resize"></img>`
  }
}

/**
 * Getting weather icon based on the current temperature
 * @param {String} temp - The temperature of any particular city in celsius
 * @returns {String} - Specifies which weather icon should be placed
 */
function getWeatherIcon (temp) {
  temp = parseInt(temp.substring(0, 2))
  if (temp > 29) {
    return 'sunny'
  } else if (temp >= 23 && temp <= 29) {
    return 'cloudy'
  } else if (temp >= 18 && temp <= 22) {
    return 'windy'
  } else {
    return 'rainy'
  }
}

/**
 * Showing nil values when invalid city name entered in the dropdown box
 */
function ariseNilValues () {
  clearInterval(setTimerId)
  document.getElementById('city-icon').innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/warningCityIcon.png" alt="alert" class="warning-icon-config" id="icon-resize">'
  document.getElementById('temp-c-val').innerHTML = '<br>&nbsp;Nil'
  document.getElementById('humidity-val').innerHTML = '<br>Nil'
  document.getElementById('temp-f-val').innerHTML = '<br>&nbsp;Nil'
  document.getElementById('precipitation-val').innerHTML = '<br>Nil'
  document.getElementById('city-dropdown').value = ''
  document.getElementById('time').innerHTML = '<div style="margin-top:20%; font-size: 200%">NIL</div>'
  document.getElementById('seconds').textContent = ''
  document.getElementById('time-icon').innerHTML = ''
  document.getElementById('date').textContent = ''

  for (let i = 1; i <= 6; i++) {
    document.getElementById(`timing-${i}`).textContent = 'Nil'
    document.getElementById(`timeline-temp-${i}`).textContent = 'Nil'
    document.getElementById(`weather-status-icon-${i}`).innerHTML = '<img src="Assets/HTML & CSS/General Images & Icons/warningWeatherIcon.png" alt="alert" class="weather-icon-resize">'
  }
}

// Section 2 (Middle Section)

/**
 * For sorting purpose, getting the current weather status. Separating as sunny or snowy or else rainy
 * @param {Number} temp - The current temperature of any particular city in celsius
 * @param {Number} humidity - The humidity in value in percentage
 * @param {Number} precipitation - The precipitation value in percentage
 * @returns {String} - Returns the weather status of the respective city
 */
function getWeatherStatus (temp, humidity, precipitation) {
  if (temp >= 29 && humidity < 50 && precipitation >= 50) {
    return 'sunny'
  } else if ((temp >= 20 && temp <= 28) && humidity > 50 && precipitation < 50) {
    return 'snowy'
  } else if (temp < 20 && humidity >= 50) {
    return 'rainy'
  }
}

/**
 * Based upon the number of cards, the arrow icons for scrolling are enabled or disabled
 */
function hideOrEnableScrollArrow () {
  const leftArrow = document.getElementsByClassName('display-left-arrow')[0]
  const rightArrow = document.getElementsByClassName('display-right-arrow')[0]
  const cityContainer = document.getElementsByClassName('show-cities')[0]

  if (cityContainer.scrollWidth <= cityContainer.clientWidth) {
    leftArrow.style.display = 'none'
    rightArrow.style.display = 'none'
    cityContainer.style.justifyContent = 'center'
  } else {
    leftArrow.style.display = 'flex'
    rightArrow.style.display = 'flex'
    cityContainer.style.justifyContent = 'start'
  }
}

/**
 * Sorting the cities based on the current weather status and respective conditions
 * @param {String} selectedWeatherButton - The weather status button that has been clicked in the middle section
 * @returns {Array} - An array of sorted cities which are in the current weather condition
 */
function sortCities (selectedWeatherButton) {
  const filteredCities = []
  let status
  let i = 0

  // Adding the cities in the filteredCities array based upon conditions
  for (const city in jsonData) {
    const cityData = jsonData[city]
    status = getWeatherStatus(parseInt(cityData.temperature), parseInt(cityData.humidity), parseInt(cityData.precipitation))
    if (selectedWeatherButton === status) {
      filteredCities[i++] = cityData.cityName
    }
  }

  // Returning the filtered array in sorted manner
  // Sorting is based upon temperature, precipitation and humidity repectively for sunny, snowy and rainy
  return filteredCities.sort(function (a, b) {
    let propertyOne, propertyTwo
    a = a.toLowerCase()
    b = b.toLowerCase()

    if (weatherButtonStatus.weatherStatusGlobalVariable === 'sunny') {
      propertyOne = parseInt(jsonData[a].temperature.slice(0, -2))
      propertyTwo = parseInt(jsonData[b].temperature.slice(0, -2))
    } else if (weatherButtonStatus.weatherStatusGlobalVariable === 'snowy') {
      propertyTwo = parseInt(jsonData[b].precipitation.slice(0, -1))
      propertyOne = parseInt(jsonData[a].precipitation.slice(0, -1))
    } else if (weatherButtonStatus.weatherStatusGlobalVariable === 'rainy') {
      propertyOne = parseInt(jsonData[a].humidity.slice(0, -1))
      propertyTwo = parseInt(jsonData[b].humidity.slice(0, -1))
    }

    if (propertyOne > propertyTwo) return -1
    else if (propertyOne < propertyTwo) return 1
    return 0
  })
}

// Section 3 (Bottom Section)

/**
 * Sorting the cards lexicographically upon continent name
 * @param {String} order - Specifies the order of sorting, whether ascending or else descending
 */
function sortByContinent (order) {
  sortedByContinentName = true
  bottomSectionCities.sort(function (a, b) {
    if(order === 'ascending')
      return jsonData[b].timeZone.split('/')[0].localeCompare(jsonData[a].timeZone.split('/')[0])
    else
      return jsonData[a].timeZone.split('/')[0].localeCompare(jsonData[b].timeZone.split('/')[0])
  })
  updateBottomSection(bottomSectionCities)
}

// Below function can be considered as a utility function for the continent sort option --
// -- If the continent name is same then the sorting would be based upon temperature

/**
 * Sorting the cards by temperature value
 * @param {String} order - Specifies the order of sorting, whether ascending or else descending
 */
function sortByTemp (order) {
  // Checking whether the temp-sort option is clicked after continent sort or not
  if(sortedByContinentName) {
    const continentGroups = groupCitiesByContinent()
    for (const continentName in continentGroups) {
      if (continentGroups[continentName].length > 1) {
        // Sort the cities within this continent by temperature
        continentGroups[continentName].sort((a, b) => {
          const tempOne = parseInt(jsonData[a].temperature)
          const tempTwo = parseInt(jsonData[b].temperature)

          if(order === 'ascending')
            return tempTwo - tempOne
          else
            return tempOne - tempTwo
        })
      }
    }

    // Reconstruct the sorted city array
    const sortedCities = Object.values(continentGroups).flat()
    updateBottomSection(sortedCities)
    return
  }

  bottomSectionCities.sort(function (a, b) {
    const tempOne = parseInt(jsonData[a].temperature)
    const tempTwo = parseInt(jsonData[b].temperature)

    if(order === 'ascending')
      return tempTwo - tempOne
    else
      return tempOne - tempTwo
  })
  updateBottomSection(bottomSectionCities)
}

/**
 * Grouping various cities together based on the continent name
 * @returns {Object} - All the bottom section cities grouped by continent name
 */
function groupCitiesByContinent() {
  const groups = {}
  for (const city of bottomSectionCities) {
    const continentName = jsonData[city].timeZone.split('/')[0]
    if (!groups[continentName]) {
      groups[continentName] = []
    }
    groups[continentName].push(city)
  }
  return groups
}
