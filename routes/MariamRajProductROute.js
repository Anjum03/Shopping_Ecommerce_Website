
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require('../model/categoryModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2;
const UserProduct = require("../model/userProductModel")

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/userProduct/category', async (req, res) => {
  try {

const query = {
  publish: { $in: [true] } // Include documents with publish: true and publish: false
};
    const userProducts = await UserProduct.find(query);

    res.status(200).json({success: true,message: `Products for Category ID `, userProduct: userProducts});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /category - Get all categories
router.get("/category/:categoryId/userProducts", verifyAdminToken, isAdmin, async (req, res) => {
  try {
      const categoryId = req.params.categoryId;
      const category = await Category.findById(categoryId);
      if (!category) {
          return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
      }

      const userProducts = await UserProduct.find();
      res.status(200).json({ success: true, message: `Products for Category ID ${categoryId}`, data: userProducts });
  } catch (error) {
    console.log(error)
      res.status(500).json({ success: false, error: 'Server error' });
  }
});


router.get('/category/:categoryId/userProducts/:productId', async (req, res) => {
  try {
      const categoryId = req.params.categoryId;
      const productId = req.params.productId;

      // Check if the category and product exist in the database
      const category = await Category.findById(categoryId);
      if (!category) {
          return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
      }

      const product = await UserProduct.findById({ _id: productId});
      if (!product) {
          return res.status(404).json({ success: false, error: `Product not found with id ${productId}` });
      }

      res.status(200).json({ success: true, data: product });

  } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
  }
});


router.post("/category/:categoryId/userProduct", verifyAdminToken, isAdmin, async (req, res) => {
    // Get the category ID from the URL parameter
    const categoryId = req.params.categoryId;
    // Find the category in the database
    const category = await Category.findById(categoryId);

    if (!category) {
        return res.status(404).send({ error: 'Category not found' });
    }
    const categoryUserProduct = category.name;

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
    const discountPercentage = parseInt(req.body.discount.replace("%", ""));
    const price = parseFloat(req.body.price);
    const discountAmount = price * (discountPercentage / 100);
    const discountedPrice = price - discountAmount;
    const totalPrice = Math.round(discountedPrice);
    
  
    const {
      name,
      event,
      discount,
      type,
      categories,
      tags,
      excerpt,
      bodyShape,
      age,
      clothMeasurement,
      returnPolicy,
      publish,
      // stock
    } = req.body;
    // Get the colors and materials from the request body
const colors = req.body.colors.split(",");
const materials = req.body.materials.split(",");
const stockValues = req.body.stockAvailability.split(",");

const variations = colors.map((color, colorIndex) => {
  const colorObj = {
    name: color,
    thumb: imageUrls[colorIndex],
  };

  const materialsList = materials.map((material) => {
    return {
      name: material,
      slug: material.toLowerCase(),
      thumb: imageUrls[colorIndex],
      price: price,
    };
  });

  const sizesArray = req.body.sizes.split(",").map((value) => value.trim());
  const sizesList = sizesArray.map((size, sizeIndex) => {
    const stockIndex = sizeIndex % stockValues.length;
    const stockAvailability = parseInt(stockValues[stockIndex]);

    return {
      name: size,
      stockAvailability:  0 || stockAvailability,
    };
  });

  return {
    id: colorIndex + 1,
    title: colorObj.name,
    color: colorObj,
    materials: materialsList,
    sizes: sizesList,
  };
});
  
    const userProduct = new UserProduct({
      name,
      event,
      discount,
      type,
      categories: categoryUserProduct,
      tags:categoryUserProduct,
      thumbs: imageUrls.slice(0,2),
      previewImages: imageUrls,
      excerpt,
      bodyShape,
      age,
      clothMeasurement,
      returnPolicy,
      publish,totalPrice,
      variations,
    });
  
    // Save the userProduct to the database
    await userProduct.save();
  
    // Add the product to the category's products array
    category.userProducts.push(userProduct._id);
    await category.save();
  
    res.status(201).json({
      success: true,
      data: {
        userProduct,
      },
    });
  } 
  
  

    
    catch (error) {
  console.log(error)
  res.status(500).json({ success: false, error: "Server error" });
}
});



//update
// //update
// router.put('/category/:categoryId/userProduct/:productId',verifyAdminToken, isAdmin, async(req,res)=>{
//   const { productId, categoryId } = req.params;
  
//       // Find the category in the database
//       const category = await Category.findById(categoryId);
//       const product = await UserProduct.findById(productId);
//       const categoryUserProduct = category.name;
//       const discountPercentage = parseInt(req.body.discount);
//       const price = parseFloat(req.body.price);
//       const discountAmount = price * (discountPercentage / 100);
//       const discountedPrice = price - discountAmount;
//       const totalPrice = Math.round(discountedPrice);

//         if (!category || !product) {
//             return res.status(404).send({ error: 'Product or Category not found' });
//         }
        
//         // Check if new image files are being uploaded
//         let newImageUrls = product.imageUrl;
//         if (req.files && req.files.photos) {
//             const files = req.files.photos;
//             let uploadPromises;
//             if (Array.isArray(files)) {
//                 uploadPromises = files.map((file) => {
//                     return new Promise((resolve, reject) => {
//                         cloudinary.uploader.upload(
//                             file.tempFilePath,
//                             {
//                                 resource_type: 'image',
//                                 format: file.mimetype.split('/')[1],
//                             },
//                             (err, result) => {
//                                 if (err) {
//                                     reject(err);
//                                 } else {
//                                     resolve(result.url);
//                                 }
//                             }
//                         );
//                     });
//                 });
//             } else {
//                 uploadPromises = [
//                     new Promise((resolve, reject) => {
//                         cloudinary.uploader.upload(
//                             files.tempFilePath,
//                             {
//                                 resource_type: 'image',
//                                 format: files.mimetype.split('/')[1],
//                             },
//                             (err, result) => {
//                                 if (err) {
//                                     reject(err);
//                                 } else {
//                                     resolve(result.url);
//                                 }
//                             }
//                         );
//                     }),
//                 ];
//             }
//             newImageUrls = await Promise.all(uploadPromises);
            
//         }

//   try {
     
//     product.name = req.body.name || product.name;
//     product.event = req.body.event || product.event;
//     product.discount = req.body.discount || product.discount;
//     product.type = req.body.type || product.type;
//     product.categories = categoryUserProduct || product.categories;
//     product.tags = categoryUserProduct || product.tags;
//     product.excerpt = req.body.excerpt || product.excerpt;
//     product.bodyShape = req.body.bodyShape || product.bodyShape;
//     product.age = req.body.age || product.age;
//     product.clothMeasurement = req.body.clothMeasurement || product.clothMeasurement;
//     product.returnPolicy = req.body.returnPolicy || product.returnPolicy;
//     product.publish = req.body.publish || product.publish;
//     product.stock = req.body.stock || product.stock;
//     product.previewImages = newImageUrls || product.previewImages;
//     product.thumbs = newImageUrls && newImageUrls.slice(0, 2) || product.thumbs;
//      product.price = parseFloat(req.body.price) || product.price;
  
//     if (req.body.colors || req.body.materials || req.body.sizes || req.body.stock) {
//       const colors = req.body.colors ? req.body.colors.split(",") : product.variations.map(variation => variation.color.name);
//       const materials = req.body.materials ? req.body.materials.split(",") : product.variations[0].materials.map(material => material.name);
//       const sizesArray = req.body.sizes ? req.body.sizes.split(",").map(value => value.trim()) : product.variations[0].sizes.map(size => size.name);
    
//       const stockValues = req.body.stock ? req.body.stock.split(",") : product.variations[0].sizes.map(size => size.stock.toString());
      
//       const variations = colors.map((color, colorIndex) => {
//         const colorObj = {
//           name: color,
//           thumb: newImageUrls[0],
//         };
    
//         const materialsList = materials.map(material => {
//           return {
//             name: material,
//             slug: material.toLowerCase(),
//             thumb: newImageUrls[0],
//             price: product.price,
//           };
//         });
    
//         const sizesList = sizesArray.map((size , sizeIndex) => {
//           const stockIndex = sizeIndex % stockValues.length ;
//           const stock = parseInt(stockValues[stockIndex])
//           return {
//             name: size,
//             stock: isNaN (stock) ? 0 : stock,
//           };
//         });
    
//         return {
//           id: colorIndex + 1,
//           title: colorObj.name,
//           color: colorObj,
//           materials: materialsList,
//           sizes: sizesList,
//         };
//       });
    
//       product.variations = variations;
//     }
    
    
 
//     const savedProduct = await product.save();
//     const productIndex = category.userProducts.findIndex((p) => p._id.toString() === productId);

//     if (productIndex !== -1) {
//       category.userProducts[productIndex] = savedProduct._id;
//     }
// console.log(`price of materials :`,savedProduct.variations.materialsList)
//     const savedCategory = await category.save();
  
//     if (!product) {
//       // Product not found
//       return res.status(404).json({
//         success: false,
//         error: "Product not found"
//       });
//     }
    
  
//     res.status(200).json({
//       success: true,
//       data: {
//         userProduct: savedProduct
//       }
//     });
//   } catch (error) {
//     // Handle any errors that occurred during the process
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: "An error occurred"
//     });
//   }
  

// })

//update

 

// ================
router.put('/category/:categoryId/userProduct/:productId', verifyAdminToken, isAdmin, async (req, res) => {
  const { productId, categoryId } = req.params;

  // Find the category in the database
  const category = await Category.findById(categoryId);
  const product = await UserProduct.findById(productId);
  const categoryUserProduct = category.name;

  if (!category || !product) {
    return res.status(404).send({ error: 'Product or Category not found' });
  }

  try {
    // Retrieve the product
    const product = await UserProduct.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    // Update the product properties
    product.name = req.body.name || product.name;
    product.event = req.body.event || product.event;
    product.discount = req.body.discount || product.discount;
    product.type = req.body.type || product.type;
    product.categories = categoryUserProduct || product.categories;
    product.tags = categoryUserProduct || product.tags;
    product.excerpt = req.body.excerpt || product.excerpt;
    product.bodyShape = req.body.bodyShape || product.bodyShape;
    product.age = req.body.age || product.age;
    product.clothMeasurement = req.body.clothMeasurement || product.clothMeasurement;
    product.returnPolicy = req.body.returnPolicy || product.returnPolicy;
    product.publish = req.body.publish || product.publish;
    // product.stockAvailability = req.body.stockAvailability || product.stockAvailability;

    // Update the previewImages and thumbs only if new images are being uploaded
    if (req.files && req.files.photos) {
      const files = req.files.photos;
      let newImageUrls;

      if (Array.isArray(files)) {
        const uploadPromises = files.map((file) => {
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
        newImageUrls = await Promise.all(uploadPromises);
      } else {
        newImageUrls = await new Promise((resolve, reject) => {
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
        });
      }

      product.previewImages = newImageUrls || product.previewImages;
      product.thumbs = newImageUrls && newImageUrls.slice(0, 2) || product.thumbs;
    }

    // Retrieve the updated product price
    const updatedPrice = parseFloat(req.body.price) || product.price;

    // Calculate the discount amount and discounted price based on the updated price
    const discountPercentage = parseInt(product.discount);
    const discountAmount = updatedPrice * (discountPercentage / 100);
    const discountedPrice = updatedPrice - discountAmount;
    const totalPrice = Math.round(discountedPrice);

    product.price = updatedPrice;
    product.totalPrice = totalPrice || product.totalPrice;

    // Update the prices of materials for each variation
    if (req.body.materials) {
      const materials = req.body.materials.split(",");

      product.variations.forEach(variation => {
        variation.materials.forEach(material => {
          if (materials.includes(material.name)) {
            material.price = updatedPrice;
          }
        });
      });
    }
          
    if (req.body.colors || req.body.materials || req.body.sizes || req.body.stockAvailability) {
      const colors = req.body.colors ? req.body.colors.split(",") : product.variations.map(variation => variation.color.name);
      const materials = req.body.materials ? req.body.materials.split(",") : product.variations[0].materials.map(material => material.name);
      const sizesArray = req.body.sizes ? req.body.sizes.split(",").map(value => value.trim()) : product.variations[0].sizes.map(size => size.name);
    
      const stockValues = req.body.stockAvailability ? req.body.stockAvailability.split(",") : product.variations[0].sizes.map(size => size.stockAvailability.toString());
      
      const variations = colors.map((color, colorIndex) => {
        const colorObj = {
          name: color,
          // thumb: newImageUrls[0] || variations.color.thumb,
          thumb: product.thumbs[0],
        };
    
        const materialsList = materials.map(material => {
          return {
            name: material,
            slug: material.toLowerCase(),
            thumb:product.thumbs[0],
           price : updatedPrice
          };
        });
    
        const sizesList = sizesArray.map((size , sizeIndex) => {
          const stockIndex = sizeIndex % stockValues.length ;
          const stockAvailability = parseInt(stockValues[stockIndex])
          return {
            name: size,
            stockAvailability:  0 || stockAvailability,
          };
        });
    
        return {
          id: colorIndex + 1,
          title: colorObj.name,
          color: colorObj,
          materials: materialsList,
          sizes: sizesList,
        };
      });
    
      product.variations = variations;
    }
    
    
        
          // Save the updated product
          const savedProduct = await product.save();
        
          // Update the reference to the updated product in the category
          const productIndex = category.userProducts.findIndex(p => p._id.toString() === productId);
          if (productIndex !== -1) {
            category.userProducts[productIndex] = savedProduct._id;
          }
          const savedCategory = await category.save();
        
          res.status(200).json({
            success: true,
            data: {
              userProduct: savedProduct
            }
          });
        } catch (error) {
          // Handle any errors that occur during the update process
          console.error(error);
          res.status(500).json({
            success: false,
            error: "Bcakend Server Error : " + error
          });
        }
      });






//delete
router.delete('/category/:categoryId/userProduct/:productId', verifyAdminToken, isAdmin, async (req, res) => {
  try {
      const { productId, categoryId } = req.params;

      // Find the category in the database
      const category = await Category.findById(categoryId);

      if (!category) {
          return res.status(404).send({ error: 'Category not found' });
      }

      // Find the product in the category's products array
      const productIndex = category.userProducts.findIndex((product) => product._id.toString() === productId);

      if (productIndex === -1) {
          return res.status(404).send({ error: 'Product not found' });
      }

      // Get the product to be deleted
      const deletedProduct = category.userProducts[productIndex];

      // Remove the product from the category's products array
      category.userProducts.splice(productIndex, 1);

      // Delete the product from the product database
      const adminProduct = await UserProduct.findByIdAndDelete(productId);

      // Delete the images from Cloudinary
      if (deletedProduct.imageUrl && deletedProduct.imageUrl.length > 0) {
          for (let i = 0; i < deletedProduct.imageUrl.length; i++) {
              const publicId = deletedProduct.imageUrl[i].split('/').slice(-1)[0].split('.')[0];
              await cloudinary.uploader.destroy(publicId);
          }
      }

      // Save the updated category to the database
      await category.save();

      res.status(200).json({
          success: true,
          msg: 'Product removed from category and user products successfully',
          data: adminProduct
      });
  } catch (error) {
    console.log(error)
      res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router ;