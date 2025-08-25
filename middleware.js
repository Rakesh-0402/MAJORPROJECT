
const Listing =require("./models/listing");
const Review =require("./models/review.js");
const CustomError =require("./utils/CustomError.js");
const{ListingSchema,reviewSchema} =require("./schema.js");
// server side validation for listing
module.exports.validateListing=(req,res,next)=>{
    let {error}=ListingSchema.validate(req.body);
       if(error){
         const msg = error.details.map(el => el.message).join(","); 
          throw new CustomError(400,msg);
       } else{
        next();
       }
    }   
//middleware to validate reviews
module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
       if(error){
         const msg = error.details.map(el => el.message).join(","); 
          throw new CustomError(400,msg);
       } else{
        next();
       }
    }

module.exports.isLoggedIn=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;//post login page
        req.flash("error" ,"you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl =(req,res ,next)=>{
      if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
      }
      next();
}

module.exports.isOwner =async(req,res ,next)=>{
    let{id} =req.params;
     let listing =await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error" ,"You are not the owner of this listing")
      return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    let{id,reviewId} =req.params;
     let review =await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash("error" ,"You are not the author of this review")
      return res.redirect(`/listings/${id}`);
    }
    next();
}
