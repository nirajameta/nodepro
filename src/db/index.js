const dotenv = require('dotenv');
const mongoose = require('mongoose');
const {DB_NAME} = require('../const')
require('dotenv').config();


const connectDB = async () => {
    try{    
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;

