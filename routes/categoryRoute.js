
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require("../model/categoryModel");
const cloudinary = require('cloudinary').v2;
const { verifyToken, isAdmin } = require('../middleware/token');

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//view all category
router.get("/category", verifyToken, isAdmin, async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//create a Category 
router.post("/category", verifyToken, isAdmin, async (req, res) => {
    try {

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
                const category = new Category({
                    name: req.body.name,
                    imageUrl: result.url,
                    // image: req.body.image
                });

                const newCategory = await category.save();
                res.status(201).json({ success: true, data: newCategory });
            })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//update category
router.put("/category/:id", verifyToken, isAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ success: false, error: "Category not found" });
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
  
          category.name = req.body.name;
          category.imageUrl = result.url;
  
          const updatedCategory = await category.save();
          res.status(200).json({ success: true, data: updatedCategory });
        }
      );
    } catch (error) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });



 //delete category
 router.delete("/category/:id", verifyToken, isAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ success: false, error: "Category not found" });
      }
      
      // Delete the image from Cloudinary
      if (category.imageUrl) {
        const publicId = category.imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    }

      await category.deleteOne();
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });
   


module.exports = router;