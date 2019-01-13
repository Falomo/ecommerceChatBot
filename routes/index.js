var express = require('express');
var router = express.Router();
const Product = require('../models/product');
let Cart = require('../models/cart');

const Wit = require('wit-api');
const wit = new Wit('NB7ZCS6F7ZLFBM2HCWZYNYBNJ3D5IPDJ');

const axios = require('axios');
const apiai = require('apiai');

const app = apiai("7624ecc172844ed8986d4d575fe7fe62");


/* GET home page. */
router.get('/', function (req, res, next) {
  Product.find((err, docs) => {
    let productChunk = [];
    let chunkSize = 3;
    for (let i = 0; i < docs.length; i += chunkSize) {
      productChunk.push(docs.splice(i, i + chunkSize));
    }
    res.render('shop/index', {
      title: 'Shopping Cart',
      products: productChunk
    });
  })
});

router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err)
      return res.redirect('/');
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  })
});

router.get('/shopping-cart', (req, res, next) => {
  if (!req.session.cart)
    return res.render('shop/shopping-cart', {
      product: null
    });

  const cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.post('/chat', (req, res) => {
  let query = req.body.queryResult;
  let {
    action,
    parameters
  } = query;

  switch (action) {
    case 'product.search':
      console.log("tees db")
      console.log(parameters);
      Product.findOne({
          Name: {
            $regex: new RegExp('' + parameters.product),
            $options: 'i'
          }
        },
        function (err, prod) {
          if (err) return handleError(err);
          console.log(prod)
        });
  }
  console.log(req.body);
  // res.redirect('/');
});

router.get('/chatbot', (req, res) => {
  res.render('user/chatbot');
})


// let text = "i want to buy rice";
let token = 'NB7ZCS6F7ZLFBM2HCWZYNYBNJ3D5IPDJ'
router.get(`/chat/:text`, (req, res) => {
  let text = req.params.text;
  req.header('Authorization: Bearer' + token)
  axios.get('https://api.wit.ai/message?v=20190109&q=' + text, {
    headers: {
      Authorization: 'Bearer ' + token //the token is a variable which holds the token
    } 
  }).then((res) => {
    console.log(res.data.entities.productsearch)
    console.log(req.session.id)
    if(res.data.entitites){
      let keyword = res.data.entities.productsearch.value;
      
    }

    
    if (!res.data.entities) {
      console.log('Im in ', text)
      var request = app.textRequest(text, {
        sessionId: req.session.id
      });

      request.on('response', function (response) {
        console.log(response);
      });

      request.on('error', function (error) {
        console.log(error);
      });

      request.end();
    }

  })

});

module.exports = router;