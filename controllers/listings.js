const Listing =require("../models/listing")
const geocodeLocation = require("../utils/geocode");
//category filtering
module.exports.index =async (req,res)=>{
    const { category } = req.query;
    let allListings;
    if(category){
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
   }
    res.render("listings/index.ejs",{allListings , category ,searchQuery: null });
    };

  module.exports.renderNewForm =(req,res)=>{
    res.render("listings/new.ejs");
}

 module.exports.showListing =async (req,res)=>{
     let {id}=req.params;
     let listing =await Listing.findById(id).populate({path:"reviews",
      populate:{
        path:"author",
      }
     }).populate("owner");
       if (!listing) {
        req.flash("error" ," Listing you requested for does not exist!");
       return res.redirect("/listings");
       // throw new CustomError(404, "Listing not found");
       }
     res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async (req,res ,next)=>{
       let url = req.file.path;
       let filename  =req.file.filename;
       let {title,description,price,location,country,category}=req.body;
      const allowedCategories = Listing.schema.path("category").enumValues;
       if (!allowedCategories.includes(category)) {
            req.flash("error", "Invalid category selected!");
            return res.redirect("/listings/new");
       }

       let newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        category,
    });
       newListing.owner =req.user._id;
       newListing.image ={url, filename};

       let coordinates = await geocodeLocation(location, country);
       newListing.geometry={type: "Point", coordinates} ;
       await newListing.save();
       req.flash("success","Listing created sucessfully!" )
       res.redirect("/listings");
}   
module.exports.renderEditForm =async (req,res)=>{
    let {id}=req.params;
    let listing =await Listing.findById(id);
    if (!listing) {
        throw new CustomError(404, "Listing not found");
    }
    let originalImageUrl =listing.image.url;
    originalImageUrl =originalImageUrl.replace("/upload", "/upload/w_250,h_250,c_fill");
    res.render("listings/edit.ejs",{listing ,originalImageUrl});
}

module.exports.updateListing =async (req, res) => {
    let { id } = req.params;
    let { title, description, price, location, country ,category } = req.body;
    let listing = await Listing.findById(id);
     if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    listing.title = title;
     listing.description = description;
     listing.price = price;
     listing.location = location;
     listing.country = country;
     listing.category = category;
    //geocode new location
    const coordinates = await geocodeLocation(location, country);
    listing.geometry={type: "Point", coordinates} ;

    if(req.file){
        listing.image = { url: req.file.path, filename: req.file.filename };
    }
    await listing.save();
    req.flash("success", "Listing updated")
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing =async(req,res)=>{
    let {id}=req.params;
   let deletedlisting= await Listing.findByIdAndDelete(id);
   console.log(deletedlisting);
    req.flash("success" ,"listing deleted");
    res.redirect("/listings");
}

module.exports.searchListing = async(req,res)=>{
    const query =req.query.q?.trim();
     if (!query) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }
     const allListings = await Listing.find({
        $or: [
              { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { location: { $regex: query, $options: "i" } },
                { country: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
        ]
    });
    
        if (allListings.length === 0) {
            req.flash("error", `No listings found for "${query}"`);
            return res.redirect("/listings");
        }

       res.render("listings/index.ejs", { allListings ,searchQuery: query ,category: null });
}
