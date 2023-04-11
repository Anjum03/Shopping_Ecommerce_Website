
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require("../model/categoryModel");
const cloudinary = require('cloudinary').v2;
const  { verifyAdminToken, isAdmin} = require('../middleware/token');

//config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//view all category
router.get("/category",  async (req, res) => {
  try {
    const categories = await Category.find().populate('products', 'primeCollections');
    res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


//filter for any pproducts or primeCollections
router.get("/category", async (req, res) => {

  try {

    let filter = {};
    if (req.query.products || req.query.primeCollections) {
      filter = { products: req.query.products.split(','), primeCollections: req.query.primeCollections.split(',') }
    }
    const categoriesList = await Category.find(filter).populate('products', 'primeCollections');
    res.status(200).json({ success: true, message: `All Categories Here ..`, data: categoriesList });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


//get by id
router.get("/category/:id",  async (req, res) => {
  try {
    const categories = await Category.findById(req.params.id).populate('products', 'primeCollections');
    res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


//get stats {total of product in numbers}
// router.get("/category/stats",  async (req, res) => {
//   try {
//     const count = await Category.countDocuments({});
//     res.status(200).json({ success: true, message: "Total Categories Here ..", count });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });




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
router.put("/category/:id", verifyAdminToken, isAdmin,async (req, res) => {
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
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = router;