const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    imagePath: {type: String, required: true},
    Name: {type: String, required: true},
    Desc: {type: String, required: true},
    Price: {type: Number, required: true},
    Keyword: {type: String, required: true}
});

module.exports = mongoose.model('Products', schema);