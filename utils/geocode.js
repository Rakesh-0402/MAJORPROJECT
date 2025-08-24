const axios = require("axios");
//geocoding 
async function geoCodeLocation(location,country){
    try{
       const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
             params: { q: `${location}, ${country}`, format: "json", limit: 1 },
             headers: { "User-Agent": "wanderlust-app/1.0 (rk92057sh@gmail.com)" }
    });
       if (geoResponse.data.length > 0) {
        //The API returns strings, so parseFloat() converts them to numbers.
         return [
            parseFloat(geoResponse.data[0].lon), // longitude
            parseFloat(geoResponse.data[0].lat)  // latitude
         ];
    } else{
          return [77.2295, 28.6129];   //default coords (New Delhi, India)
    }
    } catch(e) {
            console.error("Geocoding failed:", e.message);
    }
}

module.exports =geoCodeLocation;