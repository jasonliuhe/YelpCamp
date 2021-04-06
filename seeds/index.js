const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // Your user ID
            author: '60675d1e3143933187b36756',
            location: `${cities[random1000].city}, ${cities [random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'description',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [-113.1331, 47.0202]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dwfqoyrwg/image/upload/v1617646025/YelpCamp/xp5kc9wbvea8fpfqsz4d.jpg',
                    filename: 'YelpCamp/xp5kc9wbvea8fpfqsz4d'
                }
            ]
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})
