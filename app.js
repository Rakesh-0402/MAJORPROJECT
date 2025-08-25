
require('dotenv').config();
const express=require("express");
const app=express();
const port=process.env.PORT || 8080;
const mongoose=require("mongoose");
const path =require("path");
const CustomError =require("./utils/CustomError.js");
const methodOverride = require("method-override");
const ejsMate =require("ejs-mate");
const passport =require("passport");
const LocalStrategy=require("passport-local");
const User =require("./models/user.js");
const flash = require("connect-flash");
const session=require("express-session");
const MongoStore =require('connect-mongo');

// Routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const dbURL= process.env.ATLASDB_URL;
//connection 
main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}
//EJS setup
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine('ejs', ejsMate);

//Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

//cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser(process.env.SECRET));

//sessions
app.use(session({
  secret:process.env.SECRET,
  resave: false,              
  saveUninitialized: true,
  cookie:{
    expires:Date.now()+7 *24 *60*60 *1000,
    maxAge:7 *24 *60*60 *1000, 
    httpOnly:true, 
  },
  store:MongoStore.create({
    mongoUrl:dbURL,
    crypto :{
      secret:process.env.SECRET,
    },
    touchAfter:24*3600 ,
  })
}));
//connect-flash
app.use(flash());
  
//passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

//accessing flash messages globally
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error =req.flash("error");
    res.locals.currUser =req.user;
    next();
});

//express router
app.use("/listings" ,listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/" ,userRoutes);

// error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode =500 ,message="Something went wrong!"}= err;
   res.status(statusCode).render("error.ejs",{message});
});
//Root route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.all("*" ,(req,res,next)=>{
  throw new CustomError(404, "Page not found");
});

//start server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});
