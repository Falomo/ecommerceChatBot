var express = require('express');
var router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf();
const passport = require('passport');

router.use(csrfProtection);

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logOut();
  res.redirect('/');
})

router.get('/profile', isLoggedIn, (req, res, next) => {
  res.render('user/profile');
});

router.use('/', notLoggedIn, (req, res, next) => {
  next();
});
/* GET USER PAGE */
router.get('/signup', (req, res, next) => {
  let messages = req.flash('error');
  console.log(messages)
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}));
/* GET USER PAGE */
router.get('/signin', (req, res, next) => {
  let messages = req.flash('error');
  console.log(messages)
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signin',
  failureFlash: true
}));






module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next();
  res.redirect('/')
}
function notLoggedIn(req, res, next){
  if(!req.isAuthenticated())
    return next();
  res.redirect('/')
}