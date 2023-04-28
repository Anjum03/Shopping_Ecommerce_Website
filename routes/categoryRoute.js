
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require("../model/categoryModel");
const cloudinary = require('cloudinary').v2;
const  { verifyAdminToken, isAdmin, verifyUserToken, verifyToken, isAuthorized} = require('../middleware/token');

//config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//view all category by publish data
router.get("/category", async (req, res) => {
  try {
    const status = req.query.status;

    let categories;
    if (status && status === 'publish') {
      categories = await Category.find({ status: 'publish' }).populate('products');
    }
    res.status(200).json({ success: true, message: `All Categories of Publish Data is Here ..`, data: categories });

  } catch (error) {
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


//filter for any pproducts 
// router.get('/category',  async (req, res) => {
//   try {
//     const { role } = req.user;
//     const { status } = req.query;
//     let filter = {};
//     if (status === 'publish') {
//       filter = { isPublished: true };
//     } else if (status === 'unpublish') {
//       filter = { isPublished: false };
//     }
//     if (role === 'admin') {
//       const categoriesList = await Category.find(filter).populate('products');
//       console.log(categoriesList);
//       return res.status(200).json({ success: true, message: 'All categories here.', data: categoriesList });
//     } else {
//       const categoriesList = await Category.find({ ...filter, isPublished: true }).populate('products');
//       return res.status(200).json({ success: true, message: 'All categories here.', data: categoriesList });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, error: 'Server error' });
//   }
// });
// router.get('/category', async (req, res) => {

// // 1 .--> role = admin = show all categires and save in db 
// //2. --> role = user (register user and no register user both can view)  = only published ittem can view
// //3. --> publish = true = all categgories  shown tto user and admin
// //4. --> unpublish = true = show  item to admin but not show ittem to user

// // try{
   
// // const status = 'publish' ;
// // console.log(req.user.role);

// //   if(req.user.role === 'admin'){
// //     if(status === 'publish'){

// //       const categories = await Category.find().populate('products');
// //       res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

// //     } else{ //unplish === 'true'
// //       const categories = await Category.find().populate('products');
// //       res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

// //     }
// //   } else if(req.user.role === 'user') { // req.user.role === 'user'
 
// //     if(status === 'publish'){

// //       const categories = await Category.find().populate('products');
// //       res.status(200).json({ success: true, message: `All Categories Here ..`, data: categories });

// //     } else{
// //       return res.status(401).json({ success: false, error: 'Unauthorized' });
// //     }
// //   } else {
// //     return res.status(401).json({ success: false, error: 'Unauthorized' });
// //   }
// // } catch (error) {
// //   console.log(error);
// //   res.status(500).json({ success: false, error: 'Server error' });
// // }
// try {
//     let status = req.body.status ;
//     if(req.user.role === 'admin'
//      && status === 'publish'
//       && status === 'unpublish'){
//         const categoriesList = await Category.find(filter).populate('products');
//         res.status(200).json({ success: true, message: 'All categories here.', data: categoriesList });
//       }
//       else if(req.user.role === 'user' 
//       && status === 'publish'){
//         const categoriesList = await Category.find(filter).populate('products');
//         res.status(200).json({ success: true, message: 'All categories here.', data: categoriesList });

//       }
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });

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
        let status ;
        const category = new Category({
          name: req.body.name,
          imageUrl: result.url,
          status: req.body.status 
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
    if (req.body.status) {
      category.status = req.body.status;
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