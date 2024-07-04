const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectToMongo;