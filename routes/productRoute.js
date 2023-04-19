require('dotenv').config();
const express = require('express');
const router = express.Router();
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2;

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Define route for managing clothing products.


// Get all products in a category with paginaton
router.get('/category/:categoryId/product', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId).populate('products');
        if (!category) {
            return res.status(404).send({ error: 'Category not found' });
        }

        //pagination

        let products = category.products;

        const qNew = req.query.new;
        if (qNew) {
            products = products.sort({ createdAt: -1 }).limit(10)
        }

        res.status(200).json({ success: true, data: category.products });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//   Get by ID clothing categories
router.get('/category/:categoryId/product/:productId', async (req, res) => {
    try {

        // Get the category ID from the URL parameter
        const { productId, categoryId } = req.params;

        // Find the category in the database
        const category = await Category.findById(categoryId);
        const product = await Product.findById(productId);

        if (!category || !product) {
            return res.status(404).send({ error: 'Product or Category not found' });

        }

        res.status(200).json({ success: true, data: product });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



// Add a new product to a category
router.post("/category/:categoryId/product", verifyAdminToken, isAdmin, async (req, res) => {
    // Get the category ID from the URL parameter
    const categoryId = req.params.categoryId;
    // Find the category in the database
    const category = await Category.findById(categoryId);

    if (!category) {
        return res.status(404).send({ error: 'Category not found' });
    }

    const files = req.files;

    let uploadPromises;

    if (Array.isArray(files.photos)) {
        uploadPromises = files.photos.map((file) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    file.tempFilePath,
                    {
                        resource_type: "image",
                        format: file.mimetype.split('/')[1],
                    },
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.url);
                        }
                    }
                )
            });
        });
    } else {
        uploadPromises = [
            new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    files.photos.tempFilePath,
                    {
                        resource_type: "image",
                        format: files.photos.mimetype.split('/')[1],
                    },
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.url);
                        }
                    }
                )
            })
        ];
    }


    try {
        const imageUrls = await Promise.all(uploadPromises);

        const discountPercentage = parseInt(req.body.discount); // Assuming discount is a percentage string like "25%"

        if (isNaN(discountPercentage)) {
            return res.status(400).send({ error: 'Invalid discount value' });
        }

        const discountFactor = 1 - (discountPercentage / 100);

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            imageUrl: imageUrls,
            fabric: req.body.fabric,
            event: req.body.event,
            category: req.body.category,
            size: req.body.size,
            bodyShape: req.body.bodyShape,
            color: req.body.color,
            clothMeasurement: req.body.clothMeasurement,
            returnPolicy: req.body.returnPolicy,
            stockAvaliability: req.body.stockAvaliability,
            age: req.body.age,
            discount: req.body.discount,
            price: req.body.price * discountFactor,  
        });

        // Save the product to the database
        const newProduct = await product.save();

        // Add the product to the category's products array
        category.products.push(product._id);
        await category.save();

        // Send the new product object as the response
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: "Server error" });
    }
});



//update and  Update an existing clothing product y ID
router.put('/category/:categoryId/product/:productId', verifyAdminToken, isAdmin, async (req, res) => {

    try {

        // Get the category ID from the URL parameter
        const { productId, categoryId } = req.params;

        // Find the category in the database
        const category = await Category.findById(categoryId);
        const product = await Product.findById(productId);

        if (!category || !product) {
            return res.status(404).send({ error: 'Product or Category not found' });
        }

        // Check if new image files are being uploaded
        let newImageUrls = product.imageUrl;
        if (req.files && req.files.photos) {
            const files = req.files.photos;
            let uploadPromises;
            if (Array.isArray(files)) {
                uploadPromises = files.map((file) => {
                    return new Promise((resolve, reject) => {
                        cloudinary.uploader.upload(
                            file.tempFilePath,
                            {
                                resource_type: 'image',
                                format: file.mimetype.split('/')[1],
                            },
                            (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.url);
                                }
                            }
                        );
                    });
                });
            } else {
                uploadPromises = [
                    new Promise((resolve, reject) => {
                        cloudinary.uploader.upload(
                            files.tempFilePath,
                            {
                                resource_type: 'image',
                                format: files.mimetype.split('/')[1],
                            },
                            (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.url);
                                }
                            }
                        );
                    }),
                ];
            }
            newImageUrls = await Promise.all(uploadPromises);
        }

        // Update the product fields
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.imageUrl = newImageUrls || product.imageUrl;
        product.fabric = req.body.fabric || product.fabric;
        product.event = req.body.event || product.event;
        product.category = req.body.category || product.category;
        product.size = req.body.size || product.size;
        product.bodyShape = req.body.bodyShape || product.bodyShape;
        product.color = req.body.color || product.color;
        product.clothMeasurement =
            req.body.clothMeasurement || product.clothMeasurement;
        product.returnPolicy = req.body.returnPolicy || product.returnPolicy;
        product.stockAvaliability =
            req.body.stockAvaliability || product.stockAvaliability;
        product.age = req.body.age || product.age;
        
        // Update the discount and price fields if the discount value has changed
        const newDiscountPercentage = parseInt(req.body.discount);
        if (!isNaN(newDiscountPercentage) && newDiscountPercentage !== product.discount) {
            const newDiscountFactor = 1 - (newDiscountPercentage / 100);
            product.discount = newDiscountPercentage;
            product.price = product.price * newDiscountFactor;
        }
        const updatedProduct = await product.save();

        // Update the product in the category's products array
        const productIndex = category.products.findIndex((p) => p._id.toString() === productId);
        category.products[productIndex] = updatedProduct._id;
        await category.save();

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//delete and Delete a clothing product with imgs

router.delete('/category/:categoryId/product/:productId', verifyAdminToken, isAdmin, async (req, res) => {

    try {

        // Get the category ID from the URL parameter
        const { productId, categoryId } = req.params;

        // Find the category in the database
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).send({ error: 'Category not found' });
        }

        // Find the product in the category's products array
        const productIndex = category.products.findIndex((product) => product._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send({ error: 'Product not found' });
        }
        // Remove the product from the category's products array
        category.products.splice(productIndex, 1);

        // Find the product in the product database
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        // Delete the images from Cloudinary
        if (product.imageUrl && product.imageUrl.length > 0) {
            for (let i = 0; i < product.imageUrl.length; i++) {
                const publicId = product.imageUrl[i].split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        }
        // Delete the product from the product database
        await Product.findByIdAndDelete(productId);

        // Save the updated category to the database
        await category.save();
        res.status(200).json({ success: true, data: 'Product removed from category successfully' });

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;