require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require('../model/categoryModel');
const { verifyToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2;

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 

//Define route for managing clothing categories.
//   Get all clothing categories
router.get("/category", async (req, res) => {
    try {
        const categories = await Category.find();
        console.log(categories);
        res.status(200).json({ success: true, data: categories });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//   Create a new clothing category
router.post("/category", verifyToken, isAdmin, async (req, res) => {
    const file = req.files.photo;
    cloudinary.uploader.upload(
      file.tempFilePath,
      {
        resource_type: "image",
        format: "jpeg",
      },
      async (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ success: false, error: "Server error" });
          return;
        }
  
        const category = new Category({
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
          const newCategory = await category.save();
          console.log(newCategory);
          res.status(201).json({ success: true, data: newCategory });
        } catch (error) {
          console.log(error);
          res.status(500).json({ success: false, error: "Server error" });
        }
      }
    );
  });
  


//update and  Update an existing clothing category y ID
// Update an existing clothing category by ID
router.put('/category/:id', verifyToken, isAdmin, async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Check if a new image file is being uploaded
      let newImageUrl = category.imageUrl;
      if (req.files && req.files.photo) {
        const file = req.files.photo;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: 'image',
          format: 'jpeg',
        });
        newImageUrl = result.url;
      }
  
      // Update the category fields
      category.name = req.body.name || category.name;
      category.imageUrl = newImageUrl;
      category.fabric = req.body.fabric || category.fabric;
      category.event = req.body.event || category.event;
      category.categories = req.body.categories || category.categories;
      category.size = req.body.size || category.size;
      category.bodyShape = req.body.bodyShape || category.bodyShape;
      category.color = req.body.color || category.color;
      category.clothMeasurement =
        req.body.clothMeasurement || category.clothMeasurement;
      category.rating = req.body.rating || category.rating;
      category.stockAvaliability =
        req.body.stockAvaliability || category.stockAvaliability;
      category.age = req.body.age || category.age;
      category.price = req.body.price || category.price;
  
      const updatedCategory = await category.save();
      console.log(updatedCategory);
      res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  

//delete and Delete a clothing category

// Delete a clothing category
router.delete('/category/:id', verifyToken, isAdmin, async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Delete the image from Cloudinary
      if (category.imageUrl) {
        const publicId = category.imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
  
      await category.deleteOne();
  
      console.log('Category Deleted.................');
      res.status(200).json({ success: true, data: 'Category Deleted' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  






module.exports = router;