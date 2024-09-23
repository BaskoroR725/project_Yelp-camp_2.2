if (process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
console.log(process.env.SECRET)

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

//security features
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/expressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const userRoutes = require('./routes/user.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log("Database Connected")
})

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(
    mongoSanitize({
    replaceWith: '_',
    }),
); 

app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    //"https://api.tiles.mapbox.com/",
    //"https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    //"https://api.mapbox.com/",
    //"https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com",
];
const connectSrcUrls = [
   // "https://api.mapbox.com/",
    //"https://a.tiles.mapbox.com/",
    //"https://b.tiles.mapbox.com/",
    //"https://events.mapbox.com/",
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
    helmet.crossOriginEmbedderPolicy({
        policy: "credentialless"
    })
);

const secret = 'thisissecret'
// const secret = process.env.SECRET

/* const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    //touchAfter - lazy update for the user so we dont update session on every refresh
    crypto: {
        secret: secret
    }
}); */

const sessionConfig = {
    /* store, */
    name: 'session',
    secret:'thisissecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }
}

app.use(session(sessionConfig));
/* store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
}) */

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


/* const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
} */


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req,res) =>{
    res.render("home");
});


app.all('*', (req,res,next) =>{
    next(new ExpressError('Page Not Found', 404));
});

app.use((err,req,res,next) =>{
    const{ statusCode = 500} = err;
    if (!err.message) err.message = "Oh no, Something went wrong"
    res.status(statusCode).render('error', {err})});

app.listen(3000, () =>{
    console.log('Listening on port 3000');
});