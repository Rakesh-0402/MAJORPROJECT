const express =require("express");
//express router 
const router = express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const{isLoggedIn,isOwner,validateListing} =require("../middleware.js");

const listingController =require("../controllers/listings.js")
const multer =require("multer");
const {storage} =require("../cloudConfig.js");
const upload =multer({storage});//multer stores the files in wanderlust_DEV folder in cloudinary

//combining index route and create route bcz request is coming on same path
router.route("/")
      .get(wrapAsync(listingController.index))
      .post(
        isLoggedIn ,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.createListing)
      );
//new route
  router.get("/new", isLoggedIn ,listingController.renderNewForm);

  //(must come before :id route)
   router.get("/search",wrapAsync(listingController.searchListing));

//combining show route and update route and delete route
router.route("/:id")
      .get(wrapAsync(listingController.showListing))
      .put(
        isLoggedIn,
        isOwner ,
        upload.single("image"),
        validateListing, 
        wrapAsync(listingController.updateListing)
      )
      .delete( isLoggedIn, isOwner ,wrapAsync(listingController.deleteListing));

//edit route
router.get("/:id/edit", isLoggedIn ,isOwner,wrapAsync(listingController.renderEditForm))
 //
router.stack.forEach(r => {
  if (r.route) {
    console.log(r.route.path);
  }
});


module.exports =router;