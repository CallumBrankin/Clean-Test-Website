var express = require('express')
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
methodOverride = require('method-override'),
session = require('express-session'),
swig = require('swig'),
morgan = require('morgan'), 
util = require('util')
passport = require('passport'),
PixelPinStrategy = require('Passport-PixelPin-OpenIDConnect').Strategy;

passport.use(new PixelPinStrategy({
	clientID: "16ZLQYMHQ5MLLP0I06KUZ8R52QELB5",
	clientSecret: "HX5BRN@B7p9n2R~Mx7KjRw5@RAVw+9",
	responseType: "code",
	callbackURL: "http://node.local.com:8888/auth/pixelpin/callback"
},

function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
 
    return done(null,profile);
    });
 
    passport.serializeUser(function(user, done) {
 
    //Use for storing data in your database.
    var userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        street_address: user.street_address,
        locality: user.locality,
        region: user.region,
        postal_code: user.postal_code,
        country: user.country,
        dob: user.dob,
        gender: user.gender,
        phone: user.phone
    };
     
    done(null, user);
    });
 
 
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
 
}));

var app = express();

// configure Express
app.configure(function() {
	app.set('views', __dirname + '/view');
	app.set('view engine', 'ejs');
	app.use(require('morgan')('combined'));
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/account');
}

app.get('/', function(req,res,profile){
	res.render('index', { user: req.user});
});

app.get('/account', isAuthenticated, function(req, res, next){
	res.render('account', {
		user: req.user //gets the user data out of session and pass to template
	});
});

app.get('/login', function(req,res){
	res.render('login', { user: req.user});
});

app.get('/register', function(req,res){
	res.render('register', { user: req.user});
});

app.get('/layout', function(req,res){
	res.render('layout', { user: req.user});
});

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/');
});

app.get('/auth/pixelpin',
    passport.authenticate('pixelpin', {scope: ['profile','email','phone','address']}),
    function(req,res){
     });
 
app.get('/auth/pixelpin/callback',
    passport.authenticate('pixelpin', { failureRedirect: '/login'}),
    function(req,res) {
        res.redirect('/layout');
});

app.listen(8888);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticate(req, res, next) {
	if (req.isAuthenticated()) { return next();}
	res.redirect('/login')
}
