
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


//filter for any pproducts 
router.get('/category', async (req, res) => {

// 1 .--> role = admin = show all categires and save in db 
//2. --> role = user  = if published ittem can view
//3. --> publish = true = all categgories  shown tto user and admin
//4. --> unpublish = true = show  item to admin but not show ittem to user
try{
   
const status = 'publish' ;
  if(req.user.role === 'admin'){

    if(status === 'publish'){

      const categories = await Category.find().populate('products');
      res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

    } else{ //unplish === 'true'
      const categories = await Category.find().populate('products');
      res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

    }

  } else { // req.user.role === 'user'

    if(status === 'publish'){

      const categories = await Category.find().populate('products');
      res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

    } else{
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

  }

} catch (error) {
  res.status(500).json({ success: false, error: 'Server error' });
}

  try {
    let filter = {};
    if (req.query.publish === 'true') {
      // If publish=true and user is an admin, retrieve all categories, including those that are not published
      if (req.user && req.user.role === 'admin') {
        filter = {};
      } else {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    } else {
      // If publish is not specified or is false, retrieve only published categories
      filter = { published: true };
    }
    const categoriesList = await Category.find(filter).populate('products');
    res.status(200).json({ success: true, message: 'All categories here.', data: categoriesList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});




// router.get("/category", async (req, res) => {

//   try {

//     let filter = {};
//     if (req.query.products ) {
//       filter = { products: req.query.products.split(',') }
//     }
//     const categoriesList = await Category.find(filter).populate('products', );
//     res.status(200).json({ success: true, message: `All Categories Here ..`, data: categoriesList });

//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });


//get by id
router.get("/category/:id",  async (req, res) => {
  try {
    const categories = await Category.findById(req.params.id).populate('products');
    res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

  } catch (error) {
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
    await Product.deleteMany({ category: categoryId });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = router;