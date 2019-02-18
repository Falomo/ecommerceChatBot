var express = require('express');
var router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf();
const passport = require('passport');
const axios = require('axios');
const knex = require('../configs/knex-config');


router.use(csrfProtection);

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logOut();
  res.redirect('/');
})

router.get('/profile', isLoggedIn, async(req, res, next) => {
  console.log(req.user)
  const productList = await getRecommendations(req.user.ID)
  console.log(productList)
  const products = await getProductRecommend(productList.data.result);
  console.log("Products", products)
  let productChunk = [];
      let chunkSize = 3;
      for (let i = 0; i < products.length; i += chunkSize) {
        productChunk.push(products.splice(i, i + chunkSize));
      }
      console.log(productChunk)
      res.render('user/profile', {
        title: 'Shopping Cart',
        products: productChunk
      });
  // res.render('user/profile');
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

async function getRecommendations(id){
  let result;
  try {

  result =  axios.get('http://localhost:5000/recommend/' + id);
    
  }catch(e){
    console.log(e)
  }
  return await result;
}

async function getProductRecommend(list){
  let products = [];
  let productsId = list.split("|");  
  for(let index = 0; index < productsId.length; index++){
    let data = await knex('products').where('ProductID', productsId[index])
    products.push(data[0]);

  }
  console.log(products)
  return products;
}
