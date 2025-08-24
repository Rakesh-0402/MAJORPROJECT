const mongoose=require("mongoose");
const Review =require("./reviews.js")
//schema
const listingSchema =new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename :String,
  },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],              // Array of numbers: [longitude, latitude]
            required:true
        }
    },
    category :{
        type:String,
        enum: ["Trending", "Rooms", "Iconic cities", "Mountains", "Castles", "Amazing pools", "Farms", "Camping","Domes","Boat"],
        required:true,
    },
} , { timestamps: true });

// Index for geospatial queries
listingSchema.index({ geometry: "2dsphere" });
//post mongoose middleware
listingSchema.post("findOneAndDelete" ,async(listing)=>{
    if(listing){
          await Review.deleteMany({_id: {$in : listing.reviews}});
    }
  
})

    //model
const Listing = mongoose.model("Listing", listingSchema);

module.exports= Listing;

