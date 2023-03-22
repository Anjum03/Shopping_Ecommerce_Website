require('dotenv').config();
const express = require('express');
const router = express.Router();
const Product = require('../model/productModel');
const Category = require('../model/categoryModel')
const { verifyToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2;

//config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Define route for managing clothing products.


// Get all products in a category
router.get('/category/:categoryId/product', verifyToken, isAdmin, async (req, res) => {
  try {
      const category = await Category.findById(req.params.categoryId).populate('products');
      if (!category) {
          return res.status(404).send({ error: 'Category not found' });
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
        const categoryId = req.params.categoryId;
        const productId = req.params.productId;
        
        // Find the category in the database
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).send({ error: 'Category not found' });
            
        }
        

        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product  not found' });
        }

        res.status(200).json({ success: true, data: product });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//get by ID and whatsapp chat for product view/details pages
// npm i twilio
// router.get('/product/:id', async(req,res)=>{

//   try{
//     const product = await product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ success: false, error: 'product not found' });
//     }

//     //  // Send message to WhatsApp
//     //  const productLink = `https://example.com/products/${product.productId}`;
//     //  const message = `Check out this ${product.name} product: ${productLink}`;
//     //  const phone = '1234567890';
//     //  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

//      // Render product view with WhatsApp link
//     //  res.render('product', { product, waLink });


//     const client = require('twilio')('<your_account_sid>', '<your_auth_token>');
//     const message = await client.messages.create({
//         body: 'New products available!',
//         from: 'whatsapp:<your_twilio_number>',
//         to: 'whatsapp:<your_personal_number>'
//     });
//     console.log(message, product)
//     res.status(200).json({ success: true, data: product });

//   }catch(err){
//     console.log(err);
//     return res.status(500).json({success:false, err: `Server Error`})
//   }
// })


// Add a new product to a category

router.post("/category/:categoryId/product", verifyToken, isAdmin, async (req, res) => {

    // Get the category ID from the URL parameter
    const categoryId = req.params.categoryId;
    // Find the category in the database
    const category = await Category.findById(categoryId);

    if (!category) {
        return res.status(404).send({ error: 'Category not found' });
    }

    const file = req.files.photo;
    cloudinary.uploader.upload(
        file.tempFilePath,
        {
            resource_type: "image",
            format: "jpeg",
        },
        async (err, result) => {
            if (err) {
                res.status(500).json({ success: false, error: "Server error" });
                return;
            }

            const product = new Product({
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
                price: req.body.price,
            });

            try {
                // Save the product to the database
                const newProduct = await product.save();

                // Add the product to the category's products array
                category.products.push(product._id);
                await category.save();

                // Send the new product object as the response
                res.status(201).json({ success: true, data: newProduct });
            } catch (error) {

                res.status(500).json({ success: false, error: "Server error" });
            }
        });
});


//update and  Update an existing clothing product y ID
//upadte the product in a category
router.put('/category/:categoryId/product/:productId', verifyToken, isAdmin, async (req, res) => {

  try {

      // Get the category ID from the URL parameter
      const categoryId = req.params.categoryId;
      const productId = req.params.productId;

      // Find the category in the database
      const category = await Category.findById(categoryId);

      if (!category) {
          return res.status(404).send({ error: 'Category not found' });
      }


      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // // Check if a new image file is being uploaded
      let newImageUrl = product.imageUrl;
      if (req.files && req.files.photo) {
          const file = req.files.photo;
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
              resource_type: 'image',
              format: 'jpeg',
          });
          newImageUrl = result.url;
      }

      // Update the product fields
      product.name = req.body.name || product.name;
      product.imageUrl = newImageUrl;
      product.fabric = req.body.fabric || product.fabric;
      product.event = req.body.event || product.event;
      product.category = req.body.category || product.category;
      product.size = req.body.size || product.size;
      product.bodyShape = req.body.bodyShape || product.bodyShape;
      product.color = req.body.color || product.color;
      product.clothMeasurement =
          req.body.clothMeasurement || product.clothMeasurement;
      product.rating = req.body.rating || product.rating;
      product.stockAvaliability =
          req.body.stockAvaliability || product.stockAvaliability;
      product.age = req.body.age || product.age;
      product.price = req.body.price || product.price;

      const updatedProduct = await product.save();

      // Add the product to the category's products array
      category.products.push(product._id);
      await category.save();


      res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
  }
});


//delete and Delete a clothing product with imgs
//delete the product in a category
router.delete('/category/:categoryId/product/:productId', verifyToken, isAdmin, async (req, res) => {

  try {

      // Get the category ID from the URL parameter
      const categoryId = req.params.categoryId;
      const productId = req.params.productId;

      // Find the category in the database
      const category = await Category.findById(categoryId);
      
      if (!category) {
          return res.status(404).send({ error: 'Category not found' });
      }

   // Find the product in the category's products array
   const productIndex = category.products.findIndex((product) => product._id.toString() === productId);
   const product = category.products[productIndex];

       if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

      // Delete the image from Cloudinary
      if (product.imageUrl) {
          const publicId = product.imageUrl.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(publicId);
      }

      // Remove the product from the category's products array
      category.products.splice(productIndex, 1);

  // Save the updated category to the database
  await category.save();
      res.status(200).json({ success: true, data:  'Product removed from category successfully' });

  } catch (error) {
      res.status(500).json(error);
  }
})







module.exports = router;