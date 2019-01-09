const Product = require('../models/product');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true}, (err) => {
  console.log('mongodb connected')
})

let products = [
    new Product({
        imagePath: '/images/image1.jpg',
        Name: 'Playstation 4',
        Desc: 'This is a very cool game',
        Price: 300
    }),
    new Product({
        imagePath: '/images/image2.jpg',
        Name: 'Television',
        Desc: 'This is a very cool tv',
        Price: 200
    }),
    new Product({
        imagePath: '/images/image3.jpg',
        Name: 'Cloth',
        Desc: 'This is a very cool cloth',
        Price: 500
    }),

];

// console.log(products);

let done = 0;

for(var x = 0; x < products.length; x++){
    products[x].save((err, results) => {
        console.log('saved')
        done++;
        if(done === products.length)
            mongoose.disconnect();
    });
}
