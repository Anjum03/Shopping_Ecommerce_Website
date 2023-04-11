require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require('../model/categoryModel')
const PrimeCollection = require('../model/primeCollectionModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');

const cloudinary = require('cloudinary').v2;

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//create primeCollection
router.post('/category/:categoryId/primeCollection',verifyAdminToken,isAdmin, async (req, res) => {

    // Get the category ID from the URL parameter
    const categoryId = req.params.categoryId;
    // Find the category in the database
    const category = await Category.findById(categoryId);

    if (!category) {
        return res.status(404).send({success:false, error: 'Category not found' });
    }

    const file = req.files.photo;
    cloudinary.uploader.upload(
        file.tempFilePath,
        { resource_type: "image", format: "jpeg" },
        async (err, result) => {
            if (err) {
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
                    returnPolicy: req.body.returnPolicy,
                    stockAvaliability: req.body.stockAvaliability,
                    age: req.body.age,
                    price: req.body.price

                });
                // Save the product to the database
                const newPrimeCollection = await primeCollection.save();

                // Add the product to the category's products array
                category.primeCollections.push(primeCollection._id);
                await category.save();

                // Send the new product object as the response
                res.status(201).json({ success: true, data: newPrimeCollection });

            } catch (error) {
                res.status(500).json({ success: false, error: 'Server error' });
            }
        }
    );
});


//   Get all clothing categories with pagination
router.get('/category/:categoryId/primeCollection', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId).populate('primeCollections');

        if (!category) {
            return res.status(404).send({success:false, error: 'Category not found' });
        }

        //pagination

        let primeCollections = category.primeCollections;

        const qNew = req.query.new;
        if (qNew) {
            primeCollections = primeCollections.sort({createdAt: -1}).limit(10)
        }

        res.status(200).json({ success: true, data: category.primeCollections });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//   Get by ID clothing categories
router.get('/category/:categoryId/primeCollection/:primeCollectionId', async (req, res) => {
    try {

        // Get the category ID from the URL parameter
        const {categoryId, primeCollectionId} = req.params ;

        // Find the category in the database
        const category = await Category.findById(categoryId);
        const primeCollection = await PrimeCollection.findById(primeCollectionId);

        if (!category || !primeCollection) {
            return res.status(404).send({success:false, error: 'PrimeCollection or Category not found' });

        }

        res.status(200).json({ success: true, data: primeCollection });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//update and  Update an existing clothing prime Collection  by ID
router.put("/category/:categoryId/primeCollection/:primeCollectionId",verifyAdminToken,isAdmin, async (req, res) => {
    try {

        // Get the category ID from the URL parameter
        const {categoryId, primeCollectionId} = req.params ;

        // Find the category in the database
        const category = await Category.findById(categoryId);
        const primeCollection = await PrimeCollection.findById(primeCollectionId);

        if (!category || !primeCollection) {
            return res.status(404).send({success:false, error: 'Prime Collection or Category not found' });
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
        primeCollection.category = req.body.category || primeCollection.category;
        primeCollection.size = req.body.size || primeCollection.size;
        primeCollection.bodyShape = req.body.bodyShape || primeCollection.bodyShape;
        primeCollection.color = req.body.color || primeCollection.color;
        primeCollection.clothMeasurement = req.body.clothMeasurement || primeCollection.clothMeasurement;
        primeCollection.returnPolicy = req.body.returnPolicy || primeCollection.returnPolicy;
        primeCollection.stockAvaliability = req.body.stockAvaliability || primeCollection.stockAvaliability;
        primeCollection.age = req.body.age || primeCollection.age;
        primeCollection.price = req.body.price || primeCollection.price


        const upadtedPrimeCollection = await primeCollection.save();

        // Add the product to the category's products array
        category.primeCollections.push(primeCollection._id);
        await category.save();

        res.status(201).json({ success: true, message: `Prime Collection Update`, data: upadtedPrimeCollection });

    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//delete and Delete a clothing prime Collection 


router.delete("/category/:categoryId/primeCollection/:primeCollectionId",verifyAdminToken,isAdmin, async (req, res) => {
    try {
        const { categoryId, primeCollectionId } = req.params;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ success: false, error: 'Category not found' });
        }

        const primeCollectionIndex = category.primeCollections.findIndex(primeCollection => primeCollection._id.toString() === primeCollectionId);

        if (primeCollectionIndex === -1) {
            return res.status(404).send({ error: 'Prime Collection not found' });
        }

        category.primeCollections.splice(primeCollectionIndex, 1);

        const primeCollection = await PrimeCollection.findById(primeCollectionId);

        if (!primeCollection) {
            return res.status(404).send({ error: 'Prime Collection not found' });
        }

            if (primeCollection.imageUrl) {
                const publicId = primeCollection.imageUrl.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            await PrimeCollection.findByIdAndDelete(primeCollectionId);

            await category.save();

            res.status(201).json({ success: true, data: "Prime Collection Deleted..." });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


module.exports = router;