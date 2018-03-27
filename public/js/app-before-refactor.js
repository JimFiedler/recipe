import $ from 'jquery';
import _ from 'lodash';

$(document).ready(function() {
    var baseURL = "http://api.openweathermap.org/data/2.5/weather";

    $(".get-location-button").on("click", function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            var API_KEY = "de58fdd932d9b2bfe43433a1e7204cd9";

            var request = $.ajax(baseURL, {
                dataType: "json",
                data: {
                    lat: latitude,
                    lon: longitude,
                    appid: API_KEY,
                    units: "imperial"
                }
            });

            // Use jqXHR.done
            request.done(function(response) {
                var minTemp = response.main.temp_min;
                var maxTemp = response.main.temp_max;
                var minTempMarkup = `<p>minimum temperature: ${minTemp}</p>`;
                var maxTempMarkup = `<p>maximum temperature: ${maxTemp}</p>`;

                $(".temp").html(minTempMarkup + maxTempMarkup);
            });
        });
    });

    // User has to click a button to trigger a call to the API.
    $(".get-data-button").on("click", function() {

        // Allow the user to enter a zip code.
        var zip = $(".zip-code-input").val();

        // Set your API key as a string below
        var API_KEY = "de58fdd932d9b2bfe43433a1e7204cd9";

        var request = $.ajax(baseURL, {
            dataType: "json",
            // Use the data property in the settings object to construct the query
            // string rather than direct string concatenation.
            data: {
                zip: zip + ",us",
                appid: API_KEY,
                // Request temperature in Fahrenheit. By default, temperature will be
                // returned in Kelvin. More information here:
                // http://openweathermap.org/current#data
                units: "imperial"
            }
        });

        // Use jqXHR.done
        request.done(function(response) {
            var minTemp = response.main.temp_min;
            var maxTemp = response.main.temp_max;
            var minTempMarkup = `<p>minimum temperature: ${minTemp}</p>`;
            var maxTempMarkup = `<p>maximum temperature: ${maxTemp}</p>`;

            $(".temp").html(minTempMarkup + maxTempMarkup);
        });
    });
});
