var express = require('express');
var router = express.Router();
const Product = require('../models/product');
let Cart = require('../models/cart');

const Wit = require('wit-api');
const wit = new Wit('NB7ZCS6F7ZLFBM2HCWZYNYBNJ3D5IPDJ');

const axios = require('axios');
const apiai = require('apiai');

const knex = require('../configs/knex-config');

const app = apiai("7624ecc172844ed8986d4d575fe7fe62");


/* GET home page. */
router.get('/', function (req, res, next) {
  knex.select('*').from('products')
    .then((data, err) => {
      let productChunk = [];
      let chunkSize = 3;
      for (let i = 0; i < data.length; i += chunkSize) {
        productChunk.push(data.splice(i, i + chunkSize));
      }
      console.log(productChunk)
      res.render('shop/index', {
        title: 'Shopping Cart',
        products: productChunk
      });

    })
});

router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  addToCart(productId, req, function(){ res.redirect('/')});
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

// router.post('/chat', (req, res) => {
//   let query = req.body.queryResult; 
//   let {
//     action,
//     parameters
//   } = query;

//   switch (action) {
//     case 'product.search':
//       console.log("tees db")
//       console.log(parameters);
//       Product.findOne({
//           Name: {
//             $regex: new RegExp('' + parameters.product),
//             $options: 'i'
//           }
//         },
//         function (err, prod) {
//           if (err) return handleError(err);
//           console.log(prod)
//         });
//   }
//   console.log(req.body);
//   // res.redirect('/');
// });

router.get('/chatbot', (req, res) => {
  res.render('user/chatbot');
})


// let text = "i want to buy rice";
let token = 'NB7ZCS6F7ZLFBM2HCWZYNYBNJ3D5IPDJ'
router.get(`/chats/:text`, (req, res) => {
  let text = req.params.text;
  req.header('Authorization: Bearer' + token)
  axios.get('https://api.wit.ai/message?v=20190109&q=' + text, {
    headers: {
      Authorization: 'Bearer ' + token //the token is a variable which holds the token
    } 
  }).then((result) => {
    console.log('entities', result.data.entities) 
    let search = result.data.entities ? true : false;
    // console.log(result.data.entities.productsearch)
    // console.log(req.session.id)
    console.log('search ', search)

    if(search) { 
      let entity = result.data.entities;
      let key = Object.keys(entity)[1];

      switch(key){
        case 'number':
        let num = entity.number[0].value;
        console.log('its a number: ', num);
        console.log(req.session.productSearch[num-1]);
          break;
        case 'productsearch':
          let keyword = entity.productsearch[0].value;
          knex.select('*').from('products').where({ keyword })
            .then((data, err) => {
              // console.log('These are the top picks : ', data);
              req.session.productSearch = data;
              res.send(JSON.stringify(data));
              console.log('Session id search : ',req.session.id)
            })
          break;
        default:
            console.log('its tunioniown');
      }
      // console.log('keyword', keyword)
    } else {
      console.log('Im in ', text)
      var request = app.textRequest(text, {
        sessionId: req.session.id
      });

      request.on('response', function (response) {
        console.log('dialogdlow', response); 
      });

      request.on('error', function (error) {
        console.log(error);
      });

      request.end();
    }

  })

});


router.get(`/chat/:text`, (req, res) => {
  let text = req.params.text;
  let resText = {speech: null, product: null, cart: null};
  req.header('Authorization: Bearer' + token)
  var request = app.textRequest(text, {
    sessionId: req.session.id
  });

  request.on('response', async function (response) {
    console.log('dialogflow', response); 
    let action = response.result.action;
    console.log(action)
    switch(action){
      case 'item.add': {
        console.log('Item is being added ....\n')
        let result;
        try{
          result = await getWit(text, token);
        }catch(err){
          console.log(err)
        }
        let entity = result.data.entities;
        let num = entity.number[0].value;
        console.log('its a number: ', num);
        try{
          product = req.session.productSearch[num-1];

        }catch(e){
          resText.speech = 'Item was not found';
          res.json(resText);

        }
        resText.speech = 'Item has been added to cart';
        addToCart(product['ProductID'], req, () => res.json(resText));
        

      } break;

      case 'product.search': {

          console.log('product is searchin ....\n')
          let result;
          try{
             result = await getWit(text, token);
          }catch(err){
            console.log(err)
          }
          let entity = result.data.entities;
          let keyword = entity.productsearch[0].value;
          console.log(entity)

          knex.select('*').from('products').where({ keyword })
            .then((data, err) => {
              console.log(err || !data)
              console.log(data)
              if(err || !data[0]){
                resText.speech = 'Item was not found';
                res.json(resText);
              }else{
                
                console.log('These are the top picks : ', data);
                req.session.productSearch = data;
                resText.product = data;
                res.json(resText);
                console.log('Session id search : ',req.session.id)
              }
            })
        } break;

      case 'cart.check': {
        if(req.session.cart)
          resText.cart = req.session.cart;
        else
          resText.speech = 'Cart is empty.'
        res.json(resText);
        console.log(req.session.cart)
      } break;

      case 'item.remove':{
        let result;
        try{
           result = await getWit(text, token);
        }catch(err){
          console.log(err)
        }

        let entity = result.data.entities;
        let number = entity.number[0].value;
        
        let cart = new Cart(req.session.cart);

        let cartArr = cart.generateArray();
        
        let id = cartArr[number - 1].item.ProductID
        if(id){
            cart.remove(id);
            req.session.cart = cart;
            console.log(req.session.cart);
            resText.cart = cart;
            resText.speech = `Item ${number} has been removed from cart`;
            res.json(resText);
        }else{
            resText.speech = `Item was not found`;
            res.json(resText)
        }

        

      }break;
      default:
          resText.speech = response.result.fulfillment.speech;
          console.log("res speech: ", resText)
          res.json(resText);
    }


  });

  request.on('error', function (error) {
    console.log(error);
  });

  request.end();

})


async function getWit(text, token){
  let result = axios.get('https://api.wit.ai/message?v=20190109&q=' + text, {
    headers: {
      Authorization: 'Bearer ' + token //the token is a variable which holds the token
    } 
  })
  return await result;
}

function addToCart(id, req, cb){
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  knex.select('*').from('products').where({ ProductID: id })
  .then( (data, err) => {
    let product = data[0];
    if (err)
      return err;
    cart.add(product, product['ProductID']);
    req.session.cart = cart;
    console.log(req.session.cart);
    cb();
    return data;
  });

}

function removeCart(id, req){
  

}







module.exports = router;