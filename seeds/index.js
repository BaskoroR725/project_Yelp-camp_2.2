const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log("Database Connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i = 0; i<200; i++){
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp =  new Campground({
            author: '66e317fb27d14bba7f7b549b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            /* image: `https://picsum.photos/400?random=${Math.random()}`, */
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, quasi obcaecati quo aperiam architecto eveniet. Laboriosam labore explicabo, suscipit id quibusdam dicta, tenetur enim aliquam ipsum deserunt sunt alias obcaecati.', 
            price,
            geometry: {
                type: "Point",
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dxsmu1ldq/image/upload/v1726486652/YelpCamp/agbogfmjo48ofmgz3hag.jpg',
                    filename: 'YelpCamp/agbogfmjo48ofmgz3hag',
                },
                {
                    url: 'https://res.cloudinary.com/dxsmu1ldq/image/upload/v1726486647/YelpCamp/mvh1wjjs53xirlgk1rbb.jpg',
                    filename: 'YelpCamp/mvh1wjjs53xirlgk1rbb',
                }
            ]
            
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
})