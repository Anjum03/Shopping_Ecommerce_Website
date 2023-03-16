require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const PrimeCollection = require('../model/primeCollectionModel');
const { verifyToken, isAdmin } = require('../middleware/token');

const cloudinary = require('cloudinary').v2;

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//create primeCollection
router.post('/primeCollection', verifyToken, isAdmin, async (req, res) => {

    const file = req.files.photo;
    cloudinary.uploader.upload(
        file.tempFilePath,
        { resource_type: "image", format: "jpeg" },
        async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ success: false, error: "Server error" });
                return;
            }

            try {
                const primeCollection = new PrimeCollection({
                    name: req.body.name,
                    imageUrl: result.url,
                    fabric: req.body.fabric,
                    event: req.body.event,
                    categories: req.body.categories,
                    size: req.body.size,
                    bodyShape: req.body.bodyShape,
                    color: req.body.color,
                    clothMeasurement: req.body.clothMeasurement,
                    rating: req.body.rating,
                    stockAvaliability: req.body.stockAvaliability,
                    age: req.body.age,
                    price: req.body.price

                });

                const newPrimeCollection = await primeCollection.save();
                console.log(newPrimeCollection);
                res.status(201).json({ success: true, data: newPrimeCollection });

            } catch (error) {
                console.log(error);
                res.status(500).json({ success: false, error: 'Server error' });
            }
        }
    );
});


//   Get all clothing categories
router.get('/primeCollection', async (req, res) => {
    try {

        const primeCollection = await PrimeCollection.find();
        console.log(primeCollection);
        res.status(200).json({ success: true, data: primeCollection });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//   Get by ID clothing categories
router.get('/primeCollection/:id', async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ success: false, error: 'Invalid request: ID is missing' });
        }
        const primeCollection = await PrimeCollection.findById(id);

        if (!primeCollection) {
            return res.status(404).json({ success: false, error: 'Prime collection not found' });
        }
        console.log(primeCollection);

        res.status(200).json({ success: true, data: primeCollection });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//update and  Update an existing clothing prime Collection  by ID
router.put("/primeCollection/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const primeCollection = await PrimeCollection.findById(req.params.id);
        if (primeCollection == null) {
            console.log("Prime Collection not Found");
            return res.status(404).json({ message: "Prime Collection not found" });
        }

        // Check if a new image file is being uploaded
        let newImageUrl = primeCollection.imageUrl;
        if (req.files && req.files.photo) {
            const file = req.files.photo;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                resource_type: 'image',
                format: 'jpeg',
            });
            newImageUrl = result.url;
        }

        primeCollection.name = req.body.name || primeCollection.name;
        primeCollection.imageUrl = newImageUrl;
        primeCollection.fabric = req.body.fabric || primeCollection.fabric;
        primeCollection.event = req.body.event || primeCollection.event;
        primeCollection.categories = req.body.categories || primeCollection.categories;
        primeCollection.size = req.body.size || primeCollection.size;
        primeCollection.bodyShape = req.body.bodyShape || primeCollection.bodyShape;
        primeCollection.color = req.body.color || primeCollection.color;
        primeCollection.clothMeasurement = req.body.clothMeasurement || primeCollection.clothMeasurement;
        primeCollection.rating = req.body.rating || primeCollection.rating;
        primeCollection.stockAvaliability = req.body.stockAvaliability || primeCollection.stockAvaliability;
        primeCollection.age = req.body.age || primeCollection.age;
        primeCollection.price = req.body.price || primeCollection.price


        const upadtedPrimeCollection = await primeCollection.save();
        console.log(upadtedPrimeCollection);
        res.status(201).json({ success: true, message: `Prime Collection Update`, data: upadtedPrimeCollection });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//update and  Update an existing clothing prime Collection  by all
router.put("/primeCollection", verifyToken, isAdmin, async (req, res) => {
    try {
        const primeCollection = await PrimeCollection.find();
        if (primeCollection == null) {
            console.log("Prime Collection not Found");
            return res.status(404).json({ message: "Prime Collection not found" });
        }

        // Check if a new image file is being uploaded
        let newImageUrl = primeCollection.imageUrl;
        if (req.files && req.files.photo) {
            const file = req.files.photo;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                resource_type: 'image',
                format: 'jpeg',
            });
            newImageUrl = result.url;
        }

        primeCollection.name = req.body.name || primeCollection.name;
        primeCollection.imageUrl = newImageUrl;
        primeCollection.fabric = req.body.fabric || primeCollection.fabric;
        primeCollection.event = req.body.event || primeCollection.event;
        primeCollection.categories = req.body.categories || primeCollection.categories;
        primeCollection.size = req.body.size || primeCollection.size;
        primeCollection.bodyShape = req.body.bodyShape || primeCollection.bodyShape;
        primeCollection.color = req.body.color || primeCollection.color;
        primeCollection.clothMeasurement = req.body.clothMeasurement || primeCollection.clothMeasurement;
        primeCollection.rating = req.body.rating || primeCollection.rating;
        primeCollection.stockAvaliability = req.body.stockAvaliability || primeCollection.stockAvaliability;
        primeCollection.age = req.body.age || primeCollection.age;
        primeCollection.price = req.body.price || primeCollection.price


        const upadtedPrimeCollection = await primeCollection.save();
        console.log(upadtedPrimeCollection);
        res.status(201).json({ success: true, message: `Prime Collection Update`, data: upadtedPrimeCollection });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//delete and Delete a clothing prime Collection 
router.delete("/primeCollection/:id", verifyToken, isAdmin, async (req, res) => {
    try {

        const primeCollection = await PrimeCollection.findById(req.params.id);

        if (primeCollection == null) {
            console.log("Prime Collection not Found")
            return res.status(404).json({ message: "Prime Collection not found" });
        }

        // Delete the image from Cloudinary
        if (primeCollection.imageUrl) {
            const publicId = primeCollection.imageUrl.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await primeCollection.deleteOne();
        console.log("Prime Collection  Deleted .................");
        res.status(201).json({ success: true, data: "Prime Collection  Deleted ..." });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });

    }
})


module.exports = router;