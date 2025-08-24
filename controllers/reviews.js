const Review =require("../models/reviews.js");
const Listing= require("../models/listing.js");
const CustomError =require("../utils/CustomError.js");

module.exports.addReview =async(req,res)=>{
        let listing =await Listing.findById(req.params.id);
        if(!listing){
          throw new CustomError(404, "Listing not found");
        }
        let {rating,comment}=req.body;
        console.log(req.body);
        let review = new Review({rating,comment,author:req.user._id});
        await review.save();
        
        listing.reviews.push(review);
        await listing.save();

        req.flash("success" ,"New Review added");
        res.redirect(`/listings/${listing._id}`);
        
}

module.exports.deleteReview =async (req,res)=>{
    let {id ,reviewId} =req.params;
   await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
   await Review.findByIdAndDelete(reviewId);
   req.flash("success" ,"Review deleted");
   res.redirect(`/listings/${id}`)
}
