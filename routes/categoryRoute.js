
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const cloudinary = require('cloudinary').v2;
const  { verifyAdminToken, isAdmin, } = require('../middleware/token');

//config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//view all category by publish data
router.get("/category", async (req, res) => {
  try {
let publish ;
    let categories;
    if (publish === true) {
      categories = await Category.find({ publish: 'true' }).populate('products');
    }
    res.status(200).json({ success: true, message: `All Categories of Publish Data is Here ..`, data: categories });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /category - Get all categories
router.get("/categories",verifyAdminToken, isAdmin,  async (req, res) => {
  try {
    
    const categories = await Category.find().populate('products');
    res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



//get stats {total of product in numbers}
router.get("/category/stats",  async (req, res) => {
  try {
    const count = await Category.countDocuments({});
    res.status(200).json({ success: true, message: "Total Categories Here ..", count });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});


//get by id
router.get("/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId).populate('products');
    
    if (!category) {
      return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
    }
    
    res.status(200).json({ success: true, message: `Category found with id ${categoryId}`, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});




//create a Category 
router.post("/category",verifyAdminToken, isAdmin, async (req, res) => {
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
          publish: req.body.publish
        });
      
          const newCategory = await category.save();
          res.status(201).json({ success: true, data: newCategory });
      })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



//update category
router.put("/category/:id", verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Update the category name if a new name is provided
    if (req.body.name) {
      category.name = req.body.name;
    }
    if (req.body.publish) {
      category.publish = req.body.publish;
    }
    // Update the category image if a new image is provided
    if (req.files && req.files.photo) {
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

          category.imageUrl = result.url;

          const updatedCategory = await category.save();
          res.status(200).json({ success: true, data: updatedCategory });
        }
      );
    } else {
      const updatedCategory = await category.save();
      res.status(200).json({ success: true, data: updatedCategory });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});




//delete category
router.delete("/category/:id", verifyAdminToken, isAdmin, async (req, res) => {
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
    await Product.deleteOne({ category: categoryId });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = router;