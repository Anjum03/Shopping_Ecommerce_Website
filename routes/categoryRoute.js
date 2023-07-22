
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require("../model/categoryModel");
const UserProduct = require("../model/userProductModel");
const cloudinary = require('cloudinary').v2;
const  { verifyAdminToken, isAdmin, } = require('../middleware/token');

//config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//view all category by publish data
router.get('/category', async (req, res) => {
  try {
    const query = {
      publish: { $in: [true] } // Include documents with publish: true and publish: false
    };

    const categories = await Category.find(query)

    res.status(200).json({
      success: true,
      message: 'Products for Category ID',
      data: categories
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});




// GET /category - Get all categories

router.get("/categories", verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'userProducts',
      model: 'UserProduct'
    });

    res.status(200).json({ success: true, message: 'All Categories Here ..', data: categories });
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
    const category = await Category.findById(categoryId).populate('userProducts');
    // const userProducts = await UserProduct.find({  publish : true });

    if (!category) {
      return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
    }

    res.status(200).json({ success: true, message: `Category found with id ${categoryId}`, data: category,  });
  } catch (error) {
    console.log(error)
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
        format: file.mimetype.split('/')[1]
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
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



router.put("/category/:id", verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Update the category name if a new name is provided
    // if (req.body.name) {
    //   category.name = req.body.name;
    // }
     // Update the category name if a new name is provided
    if (req.body.name) {
      const newCategoryName = req.body.name;

     
      // Update the category name in associated user products
      await UserProduct.updateMany({ categories: category.name }, { $set: { "categories.$": newCategoryName } });
      await UserProduct.updateMany({ tags: category.name }, { $set: { "tags.$": newCategoryName } });

      category.name = newCategoryName;
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
    res.status(500).json({ success: false, error: "Server error" });
  }
});



// //update category
// router.put("/category/:id", verifyAdminToken, isAdmin, async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const category = await Category.findById(categoryId);

//     if (!category) {
//       return res.status(404).json({ success: false, error: "Category not found" });
//     }

//     // Update the category name if a new name is provided
//     if (req.body.name) {
//       const newCategoryName = req.body.name;

//       // Update the category name in associated products
//       await Product.updateMany({ categories: category.name }, { $set: { "categories.$": newCategoryName } });
//       await Product.updateMany({ tags: category.name }, { $set: { "tags.$": newCategoryName } });

//       // Update the category name in associated user products
//       await UserProduct.updateMany({ categories: category.name }, { $set: { "categories.$": newCategoryName } });
//       await UserProduct.updateMany({ tags: category.name }, { $set: { "tags.$": newCategoryName } });

//       category.name = newCategoryName;
//     }

//     // Update the category image if a new image is provided
//     // if (req.files && req.files.photo) {
//     //   const file = req.files.photo;
//     //   cloudinary.uploader.upload(
//     //     file.tempFilePath,
//     //     {
//     //       resource_type: "image",
//     //       format: "jpeg",
//     //     },
//     //     async (err, result) => {
//     //       if (err) {
//     //         res.status(500).json({ success: false, error: "Server error" });
//     //         return;
//     //       }

//     //       const newImageUrl = result.url;

//     //       // Update the category image in associated products
//     //       await Product.updateMany({ categories: category.imageUrl }, { $set: { imageUrl: newImageUrl } });
//     //       await Product.updateMany({ tags: category.imageUrl }, { $set: { imageUrl: newImageUrl } });

//     //       // Update the category image in associated user products
//     //       await UserProduct.updateMany({ categories: category.imageUrl }, { $set: { "previewImages.$[elem]": newImageUrl } }, { arrayFilters: [{ "elem": { $in: category.imageUrl } }] });
//     //       await UserProduct.updateMany({ tags: category.imageUrl }, { $set: { "tags.$[elem]": newImageUrl } }, { arrayFilters: [{ "elem": { $in: category.imageUrl } }] });

//     //       category.imageUrl = newImageUrl;
//     //     }
//     //   );
//     // }

//     // Update the category publish status if provided
//     // if (req.body.publish !== undefined) {
//     //   const newPublishStatus = req.body.publish;

//     //   // Update the category publish status in associated products
//     //   await Product.updateMany({ categories: category.publish}, { $set: { publish: newPublishStatus } });
//     //   await Product.updateMany({ tags: category.publish}, { $set: { publish: newPublishStatus } });

//     //   // Update the category publish status in associated user products
//     //   await UserProduct.updateMany({ categories: category.publish }, { $set: { publish: newPublishStatus } });
//     //   await UserProduct.updateMany({ tags: category.publish }, { $set: { publish: newPublishStatus } });

//     //   category.publish = newPublishStatus;
//     // }

//     // Save the updated category to the database
//     await category.save();

//     res.status(200).json({ success: true, data: category });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });



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

    const deleteData =   await Category.deleteOne({ _id: categoryId });
    const deleteDataUserProduct =   await UserProduct.deleteMany({ categories: category.name });

    res.status(200).json({ success: true, data: deleteData ,  deleteDataUserProduct  });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: "Server error" });
  }
});




module.exports = router;