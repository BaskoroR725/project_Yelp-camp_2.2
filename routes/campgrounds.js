const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsynch = require('../utils/catchAsynch');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');
const Campground = require('../models/campground');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get( catchAsynch( campgrounds.index ))
    .post( isLoggedIn, upload.array('image'), validateCampground, 
        catchAsynch( campgrounds.createCampgrounds ))
    /*   .post(upload.array('image'), (req,res) => {
        console.log(req.body, req.files);
        res.send('it worked'); */
    /* })     */

router.get('/new', isLoggedIn, campgrounds.renderNewForm );

router.route('/:id')
    .get( catchAsynch( campgrounds.showCampgrounds ))
    .put( isLoggedIn, isAuthor, 
        upload.array('image'), validateCampground, catchAsynch( campgrounds.updateCampground ))
    .delete( isLoggedIn, isAuthor,
        catchAsynch( campgrounds.deleteCampground ))


router.get('/:id/edit', isLoggedIn, isAuthor, 
    catchAsynch( campgrounds.renderEditForm ));



module.exports = router;