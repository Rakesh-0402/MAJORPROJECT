require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose =require("mongoose");
let {data} = require("./data.js");
const Listing= require("../models/listing.js");
const geocodeLocation = require("../utils/geocode");
const dbURL= process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}

//function to delete all data and insert sample data
const initDB = async()=>{
  try{
    await Listing.deleteMany({});
    for (let obj of data) {
      const coordinates = await geocodeLocation(obj.location, obj.country);
      obj.owner = "68aac5214f995e44bca3380d"; // default owner
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
};
initDB();
