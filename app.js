
 require('dotenv').config();
console.log(process.env.SECRET);
const express=require("express");
const app=express();
const port=8080;
const mongoose=require("mongoose");
const path =require("path");
const CustomError =require("./utils/CustomError.js");
const methodOverride = require("method-override");
const ejsMate =require("ejs-mate");
const passport =require("passport");
const LocalStrategy=require("passport-local");
const User =require("./models/user.js");
//cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser("secretCode"));//cookie parser middleware

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


//sessions
const session=require("express-session");
const MongoStore =require('connect-mongo');
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
  
//using passport
app.use(passport.initialize());//tells express to use passport for authentication
app.use(passport.session());//Passport use sessions to remember users.

passport.use(new LocalStrategy(User.authenticate()));//This sets up a strategy = “How will we log users in?”
passport.serializeUser(User.serializeUser())//store only user ID in session
passport.deserializeUser(User.deserializeUser());//fetch full user from ID in DB

//connect-flash
const flash = require("connect-flash");
app.use(flash());

//accessing flash messages globally
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error =req.flash("error");
    res.locals.currUser =req.user;
    next();
});



//require router
const listings =require("./routes/listing.js");
const reviews =require("./routes/review.js");
const users =require("./routes/user.js");

app.set("view engine","ejs");
app.use(methodOverride('_method'));
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
 app.engine('ejs', ejsMate);

//express router
app.use("/listings" ,listings);
app.use("/listings/:id/reviews",reviews)
app.use("/" ,users);

// error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode =500 ,message="Something went wrong!"}= err;
   // res.status(statusCode).send(message);
   res.status(statusCode).render("error.ejs",{message});
});

//setting a signed cookie in browser
app.get("/setcookie",(req,res)=>{
  res.cookie("name","John",{
    signed:true,
    httpOnly:true, //security
    maxAge:1000*60*5
  });
  res.send(" signed Cookie has been set!");
  console.dir(req.cookies);
})

//reading a cookie
app.get("/getcookie", (req, res) => {
    // signed cookies are available in req.signedCookies
    const user = req.signedCookies.name;
    if (user) {
        res.send(`Welcome back, ${user}`);
    } else {
        res.send("No valid signed cookie found");
    }
});

//deleting a cookie
app.get("/clearcookie", (req, res) => {
    res.clearCookie("name");
    res.send(" signed Cookie has been cleared!");
});


//storing data in session
app.get("/set-session", (req, res) => {
    req.session.name = "Rakesh";  // storing data
    req.session.isLoggedIn = true;
    res.send("Session data has been saved!");
});

//accessing session data
app.get("/get-session", (req, res) => {
    if (req.session.isLoggedIn) {
        res.send(`Welcome back, ${req.session.name}`);
    } else {
        res.send("No active session found");
    }
});

app.use((req,res,next)=>{
  throw new CustomError(404, "Page not found");
});



//start server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});