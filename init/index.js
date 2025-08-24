const mongoose =require("mongoose");
let {data} = require("./data.js");
const Listing= require("../models/listing.js");
const geocodeLocation = require("../utils/geocode");
main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

//function to delete all data and insert sample data
const initDB = async()=>{
  try{
    await Listing.deleteMany({});
    for (let obj of data) {
      const coordinates = await geocodeLocation(obj.location, obj.country);
      obj.owner = "68a4bb69ce87b79e85243bd0"; // default owner
      obj.geometry = { type: "Point", coordinates };
      // Ensure category exists
      if (!obj.category) {
        obj.category = "Trending"; // fallback default
      }
      const listing = new Listing(obj);
      await listing.save();
}
    console.log("data initialized");
  } catch (err){
      console.error("Error initializing DB:", err);
  }
}
initDB();