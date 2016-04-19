'use strict'

let express = require('express')
let passport = require('passport')
let Strategy = require('passport-openidconnect').Strategy
let dotenv = require('dotenv').config();

passport.use(new Strategy({
	authorizationURL: 'https://' + process.env.DOMAIN + '/authorize',
	tokenURL: 'https://' + process.env.DOMAIN + '/oauth/token',
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/callback'
	},
	function(accessToken, refreshToken, profile, cb){
		cb(null, profile)
	} 
))

passport.serializeUser(function(user, cb){
	cb(null, user)
})

passport.deserializeUser(function(obj, cb){
	cb(null, obj)
})

let app = express()

app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('express-session')(
	{ 
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
	}))

app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'jade')

app.get('/',
  function(req, res){
    res.render('index')
  })

app.get('/login', passport.authenticate('openidconnect'));

app.get('/callback',
	passport.authenticate('openidconnect', { failureRedirect: '/login'}),
	function(req, res){
		//YAY! we've logged into GitHub
		res.redirect('/profile')
	});

app.get('/profile',
	require('connect-ensure-login').ensureLoggedIn(),
	function(req, res){
		res.render('user', { user: req.user })
	})

app.get('/logout', function(req, res){
	req.logout()
	res.redirect('/')
})

app.listen(3000)





