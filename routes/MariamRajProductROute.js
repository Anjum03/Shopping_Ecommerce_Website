
// require('dotenv').config();
// const express = require('express');
// const router = express.Router();
// const Category = require('../model/categoryModel');
// const { verifyAdminToken, isAdmin } = require('../middleware/token');
// const cloudinary = require('cloudinary').v2;
// const UserProduct = require("../model/userProductModel")

// //config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });


// router.get('/userProduct/category', async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 50;
//     let skip = (page - 1) * limit;

//     const query = {
//       publish: { $in: [true] } // Include documents with publish: true and publish: false
//     };

//     const countQuery = UserProduct.countDocuments(query); // Separate query for counting documents
//     const count = await countQuery;
//     const totalPages = Math.ceil(count / limit);

//     const userProductsQuery = UserProduct.find(query).skip(skip).limit(limit);
//     const userProducts = await userProductsQuery;

//     res.status(200).json({
//       success: true,
//       message: `Products for Category ID`,
//       userProduct: userProducts,
//       totalPages: totalPages,
//       currentPage: page
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });



// // GET /category - Get all categories
// router.get("/category/:categoryId/userProducts", verifyAdminToken, isAdmin, async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
//     }

//     const userProducts = await UserProduct.find();
//     res.status(200).json({ success: true, message: `Products for Category ID ${categoryId}`, data: userProducts });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });


// router.get('/category/:categoryId/userProducts/:productId', async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const productId = req.params.productId;

//     // Check if the category and product exist in the database
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, error: `Category not found with id ${categoryId}` });
//     }

//     const product = await UserProduct.findById({ _id: productId });
//     if (!product) {
//       return res.status(404).json({ success: false, error: `Product not found with id ${productId}` });
//     }

//     res.status(200).json({ success: true, data: product });

//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });



// // Helper function to format bytes into a human-readable format
// // function formatBytes(bytes) {
// //   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
// //   if (bytes === 0) return '0 Byte';
// //   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
// //   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
// // }

// const compressImage = require('compress-images')
// const axios = require('axios');
// const fs = require('fs');


// //
// router.post("/category/:categoryId/userProduct", verifyAdminToken, isAdmin, async (req, res) => {
//   // Get the category ID from the URL parameter
//   const categoryId = req.params.categoryId.split(',');
//   // Find the category in the database
//   const categoriesID = await Category.find({ _id: { $in: categoryId } });

//   if (!categoriesID) {
//     return res.status(404).send({ error: 'Category not found' });
//   }

//   const files = req.files;

//   let uploadPromises;

//   if (Array.isArray(files.photos)) {
//     uploadPromises = files.photos.map((file) => {
//       return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(
//           file.tempFilePath,
//           {
//             resource_type: "image",
//             format: file.mimetype.split('/')[1],
//           },
//           (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result.url);
//             }
//           }
//         )
//       });
//     });
//   } else {
//     uploadPromises = [
//       new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(
//           files.photos.tempFilePath,
//           {
//             resource_type: "image",
//             format: files.photos.mimetype.split('/')[1],
//           },
//           (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result.url);
//             }
//           }
//         )
//       })
//     ];
//   }

//   try {
//     const imageUrls = await Promise.all(uploadPromises);

//     // Compress and save images
//     const compressedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
//       const fileName = imageUrl.split('/').pop();
//       const filePath = `tmp/${fileName}`;
//       const compressedPath = `tmp/compressed_${fileName}`;
//       const compression = 60;

//       const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//       const imageData = Buffer.from(response.data, 'binary');
//       fs.writeFileSync(filePath, imageData);

//       return new Promise((resolve, reject) => {
//         compressImage(filePath, compressedPath, { compress_force: false, statistic: true, autoupdate: true }, false,

//           { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
//           { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
//           { svg: { engine: "svgo", command: "--multipass" } },
//           { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },

//           async function (error, completed, statistic) {
//             if (error) {
//               reject(error);
//             } else {
//               // console.log("-----------------------------------");
//               // console.log(`File from: ${filePath}`);
//               // console.log(`File to: ${compressedPath}`);
//               // console.log(`Compression algorithm: [${statistic.algorithm}]`);
//               // console.log(`Original size: [${(statistic.size_in / (1024 * 1024)).toFixed(2)}MB] | Compressed size: [${(statistic.size_output / (1024 * 1024)).toFixed(2)}MB] | Compression rate: [${((statistic.size_output / statistic.size_in) * 100).toFixed(2)}%]`);
//               // console.log("-----------------------------------");
//               //  if you want response same as termianl response 

//               resolve(compressedPath);

//             }
//             fs.unlink(filePath, function (error) {
//               if (error) console.error("Failed to unlink original image:", error);
//             });
//           }
//         );
//       });
//     }));


//     const discountPercentage = parseInt(req.body.discount.replace("%", ""));
//     const price = parseFloat(req.body.price);
//     const discountAmount = price * (discountPercentage / 100);
//     const discountedPrice = price - discountAmount;
//     const totalPrice = Math.round(discountedPrice);

//     const usdExchangeRate = 0.74;
//     const poundExchangeRate = 0.59;
//     const usdTotalPrice = Math.round(totalPrice * usdExchangeRate);
//     const poundTotalPrice = Math.round(totalPrice * poundExchangeRate);
//     const usdPrice = Math.round(price * usdExchangeRate);
//     const poundPrice = Math.round(price * poundExchangeRate);

//     const {
//       name, event, discount, type,
//       excerpt, bodyShape, age, clothMeasurement,
//       returnPolicy, publish,
//     } = req.body;

//     const colors = req.body.colors ? req.body.colors.split(",") : [];
//     const materials = req.body.materials ? req.body.materials.split(",") : [];
//     const stockValues = req.body.stockAvailability ? req.body.stockAvailability.split(",") : [];
//     // const code = req.body.code !== undefined && req.body.code.trim() !== '' ? req.body.code : colors.code;
//     const variations = colors.map((color, colorIndex) => {
//       const colorObj = {
//         name: color,
//         thumb: imageUrls[colorIndex],
//         // code: req.body.code,
//       };
//       console.log('colorobj', colorObj);
//       const materialsList = materials.map((material) => {
//         return {
//           name: material,
//           slug: material.toLowerCase(),
//           thumb: imageUrls[colorIndex],
//           price: price,
//           usdPrice: usdPrice,
//           poundPrice: poundPrice,
//         };
//       });

//       const sizesArray = req.body.sizes ? req.body.sizes.split(",").map((value) => value.trim()) : [];
//       const sizesList = sizesArray.map((size, sizeIndex) => {
//         const stockIndex = sizeIndex % stockValues.length;
//         const stockAvailability = parseInt(stockValues[stockIndex]) || 0;

//         return {
//           name: size,
//           stockAvailability: stockAvailability,
//         };
//       });

//       return {
//         id: colorIndex + 1,
//         title: colorObj.name,
//         color: colorObj,
//         materials: materialsList,
//         sizes: sizesList,
//       };
//     });

//     const responses = [];

//     for (const category of categoriesID) {

//       const userProduct = new UserProduct({
//         name, event, discount, type,
//         categories: category.name,
//         tags: category.name,
//         thumbs: imageUrls.slice(0, 2),
//         previewImages: imageUrls,
//         excerpt,
//         bodyShape,
//         age,
//         clothMeasurement,
//         returnPolicy,
//         publish,
//         totalPrice,
//         usdTotalPrice,
//         poundTotalPrice,
//         variations,
//       });

//       try {
//         // Save the userProduct to the database
//         await userProduct.save();

//         // Add the product to the category's products array
//         category.userProducts.push(userProduct._id);
//         await category.save();

//         // Collect the response for this category
//         responses.push({
//           success: true,
//           data: {
//             userProduct,
//           }
//         });
//       } catch (error) {
//         console.log(error);
//         // Collect the error response for this category
//         responses.push({
//           success: false,
//           error: 'Server error',
//         });
//       }
//     }

//     // Send all the responses together after the loop
//     res.status(201).json(responses);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Server error', error });
//   }

// });




// router.put('/category/:categoryId/userProduct/:productId', verifyAdminToken, isAdmin, async (req, res) => {
//   const { productId } = req.params;
//   // Get the category ID from the URL parameter
//   const categoryId = req.params.categoryId.split(',');
//   // Find the category in the database
//   const categoriesID = await Category.find({ _id: { $in: categoryId } });

//   if (!categoriesID) {
//     return res.status(404).send({ error: 'Category not found' });
//   }

//   // Find the category in the database
//   const category = await Category.findById(categoryId);
//   const product = await UserProduct.findById(productId);
//   const categoryUserProduct = category.name;

//   if (!product) {
//     return res.status(404).send({ error: 'Product or Category not found' });
//   }

//   const files = req.files;

//   let uploadPromises;
//   if (req.files && req.files.photos) {
//     if (Array.isArray(files.photos)) {
//       uploadPromises = files.photos.map((file) => {
//         return new Promise((resolve, reject) => {
//           cloudinary.uploader.upload(
//             file.tempFilePath,
//             {
//               resource_type: "image",
//               format: file.mimetype.split('/')[1],
//             },
//             (err, result) => {
//               if (err) {
//                 reject(err);
//               } else {
//                 resolve(result.url);
//               }
//             }
//           );
//         });
//       });
//     } else {
//       uploadPromises = [
//         new Promise((resolve, reject) => {
//           cloudinary.uploader.upload(
//             files.photos.tempFilePath,
//             {
//               resource_type: "image",
//               format: files.photos.mimetype.split('/')[1],
//             },
//             (err, result) => {
//               if (err) {
//                 reject(err);
//               } else {
//                 resolve(result.url);
//               }
//             }
//           );
//         })
//       ];
//     }
//   } else {
//     // If no new photos, use the existing photos from the product
//     uploadPromises = product.previewImages.map((imageUrl) => Promise.resolve(imageUrl));
//   }

//   try {
//     const imageUrls = await Promise.all(uploadPromises);


//     // Compress and save images
//     const compressedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
//       const fileName = imageUrl.split('/').pop();
//       const filePath = `tmp/${fileName}`;
//       const compressedPath = `tmp/compressed_${fileName}`;
//       const compression = 60;

//       const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//       const imageData = Buffer.from(response.data, 'binary');
//       fs.writeFileSync(filePath, imageData);

//       return new Promise((resolve, reject) => {
//         compressImage(filePath, compressedPath, { compress_force: false, statistic: true, autoupdate: true }, false,

//           { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
//           { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
//           { svg: { engine: "svgo", command: "--multipass" } },
//           { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },

//           async function (error, completed, statistic) {
//             if (error) {
//               reject(error);
//             } else {
//               // console.log("-----------------------------------");
//               // console.log(`File from: ${filePath}`);
//               // console.log(`File to: ${compressedPath}`);
//               // console.log(`Compression algorithm: [${statistic.algorithm}]`);
//               // console.log(`Original size: [${(statistic.size_in / (1024 * 1024)).toFixed(2)}MB] | Compressed size: [${(statistic.size_output / (1024 * 1024)).toFixed(2)}MB] | Compression rate: [${((statistic.size_output / statistic.size_in) * 100).toFixed(2)}%]`);
//               // console.log("-----------------------------------");
//               //  if you want response same as termianl response 

//               resolve(compressedPath);

//             }
//             fs.unlink(filePath, function (error) {
//               if (error) console.error("Failed to unlink original image:", error);
//             });
//           }
//         );
//       });
//     }));

//     // Retrieve the product
//     const product = await UserProduct.findById(productId);

//     // Check if the product exists
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found"
//       });
//     }

//     const responses = [];
//     for (const category of categoriesID) {
//       product.name = req.body.name || product.name;
//       product.event = req.body.event || product.event;
//       product.discount = req.body.discount || product.discount;
//       product.type = req.body.type || product.type;
//       product.categories = categoryUserProduct || product.categories;
//       product.tags = categoryUserProduct || product.tags;
//       product.excerpt = req.body.excerpt || product.excerpt;
//       product.bodyShape = req.body.bodyShape || product.bodyShape;
//       product.age = req.body.age || product.age;
//       product.clothMeasurement = req.body.clothMeasurement || product.clothMeasurement;
//       product.returnPolicy = req.body.returnPolicy || product.returnPolicy;
//       product.publish = req.body.publish || product.publish;

//       product.previewImages = imageUrls || product.previewImages;
//       product.thumbs = imageUrls && imageUrls.slice(0, 2) || product.thumbs;
//     }
//     let updatedPrice;
//     try {
//       updatedPrice = parseFloat(req.body.price);
//       if (isNaN(updatedPrice)) {
//         throw new Error("Invalid or missing price in the request.");
//       }
//     } catch (err) {
//       console.error("Error parsing the price:", err.message);
//       // Use the existing product price as a fallback
//       updatedPrice = product.price;
//     }
//     // const updatedPrice = parseFloat(req.body.price) || product.price;

//     // Handle invalid discount percentage
//     const discountPercentage = parseInt(product.discount) || 0;
//     const discountAmount = updatedPrice * (discountPercentage / 100);
//     const discountedPrice = updatedPrice - discountAmount;
//     const totalPrice = Math.round(discountedPrice);

//     // Handle potential issues with exchange rates
//     const usdExchangeRate = 0.74;
//     const poundExchangeRate = 0.59;
//     const usdTotalPrice = Math.round(totalPrice * usdExchangeRate);
//     const poundTotalPrice = Math.round(totalPrice * poundExchangeRate);
//     const usdPrice = Math.round(updatedPrice * usdExchangeRate);
//     const poundPrice = Math.round(updatedPrice * poundExchangeRate);

//     product.price = updatedPrice;
//     product.totalPrice = totalPrice || product.totalPrice;
//     product.usdTotalPrice = usdTotalPrice || product.usdTotalPrice;
//     product.poundTotalPrice = poundTotalPrice || product.poundTotalPrice;
    
//     // Update the prices of materials for each variation
//     if (req.body.materials) {
//       const materials = req.body.materials.split(",");

//       product.variations.forEach(variation => {
//         variation.materials.forEach(material => {
//           if (materials.includes(material.name)) {
//             material.price = updatedPrice;
//           }
//         });
//       });
//     }

//     // Update variations and materials
// if (req.body.colors || req.body.materials || req.body.sizes || req.body.stockAvailability) {
//   // Retrieve existing variations and materials from the product
//   const existingVariations = product.variations || [];
//   const existingMaterials = existingVariations.reduce((acc, variation) => acc.concat(variation.materials || []), []);

//   const colors = req.body.colors ? req.body.colors.split(",") : existingVariations.map(variation => variation.color.name);
//   const materials = req.body.materials ? req.body.materials.split(",") : existingMaterials.map(material => material.name);
//   const sizesArray = req.body.sizes ? req.body.sizes.split(",").map(value => value.trim()) : existingVariations[0]?.sizes?.map(size => size.name);

//   const stockValues = req.body.stockAvailability ? req.body.stockAvailability.split(",") : existingVariations[0]?.sizes?.map(size => size.stockAvailability.toString());

//   const variations = colors.map((color, colorIndex) => {
//     const existingVariation = existingVariations.find(v => v.color.name === color);
//     const variationObj = existingVariation || {
//       // color: { name: color, thumb: product.thumbs[0], code :  req.body.code || color.code },
//       color: { name: color, thumb: product.thumbs[0],
//           },
//       materials: [],
//       sizes: sizesArray.map((size, sizeIndex) => {
//         const stockIndex = sizeIndex % stockValues.length;
//         const stockAvailability = parseInt(stockValues[stockIndex])
//         return {
//           name: size,
//           stockAvailability: 0 || stockAvailability,
//         };
//       })
//     };


//     if (!existingVariation) {
//       product.variations.push(variationObj);
//     }

//     // Update usdPrice and poundPrice for all materials in the variation
//     variationObj.materials.forEach(material => {
//       material.price = updatedPrice;
//       material.usdPrice = usdPrice;
//       material.poundPrice = poundPrice;
//       // ... (update other material properties as needed)
//     });    
//     console.log(color.code || product.variations[0]?.color?.code || "",);

//     return variationObj;
//   });
//   // Remove any variations that are not in the updated colors list
//   product.variations = product.variations.filter(variation => colors.includes(variation.color.name));
// }
//     try {

//       const savedProduct = await product.save();

//       // Update the reference to the updated product in the category
//       const productIndex = category.userProducts.findIndex(p => p._id.toString() === productId);
//       if (productIndex !== -1) {
//         category.userProducts[productIndex] = savedProduct._id;
//       }
//       await category.save();

//       responses.push({
//         success: true,
//         data: {
//           userProduct: savedProduct
//         }
//       });
//     } catch (err) {
//       console.log(err);
//       // Collect the error response for this category
//       responses.push({
//         success: false, error: 'Server error', err,
//       });
//     }
//     // Save the updated product
//     res.status(201).json(responses);
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: "Backend Server Error: " + error
//     });
//   }
// });







// //delete
// router.delete('/category/:categoryId/userProduct/:productId', verifyAdminToken, isAdmin, async (req, res) => {
//   try {
//     const { productId, categoryId } = req.params;

//     // Find the category in the database
//     const category = await Category.findById(categoryId);

//     if (!category) {
//       return res.status(404).send({ error: 'Category not found' });
//     }

//     // Find the product in the category's products array
//     const productIndex = category.userProducts.findIndex((product) => product._id.toString() === productId);

//     if (productIndex === -1) {
//       return res.status(404).send({ error: 'Product not found' });
//     }

//     // Get the product to be deleted
//     const deletedProduct = category.userProducts[productIndex];

//     // Remove the product from the category's products array
//     category.userProducts.splice(productIndex, 1);

//     // Delete the product from the product database
//     const adminProduct = await UserProduct.findByIdAndDelete(productId);

//     // Delete the images from Cloudinary
//     if (deletedProduct.imageUrl && deletedProduct.imageUrl.length > 0) {
//       for (let i = 0; i < deletedProduct.imageUrl.length; i++) {
//         const publicId = deletedProduct.imageUrl[i].split('/').slice(-1)[0].split('.')[0];
//         await cloudinary.uploader.destroy(publicId);
//       }
//     }

//     // Save the updated category to the database
//     await category.save();

//     res.status(200).json({
//       success: true,
//       msg: 'Product removed from category and user products successfully',
//       data: adminProduct
//     });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// module.exports = router;


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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    let skip = (page - 1) * limit;

    const query = {
      publish: { $in: [true] } // Include documents with publish: true and publish: false
    };

    const countQuery = UserProduct.countDocuments(query); // Separate query for counting documents
    const count = await countQuery;
    const totalPages = Math.ceil(count / limit);

    const userProductsQuery = UserProduct.find(query).skip(skip).limit(limit);
    const userProducts = await userProductsQuery;

    res.status(200).json({
      success: true,
      message: `Products for Category ID`,
      userProduct: userProducts,
      totalPages: totalPages,
      currentPage: page
    });
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

    const product = await UserProduct.findById({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, error: `Product not found with id ${productId}` });
    }

    res.status(200).json({ success: true, data: product });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



// Helper function to format bytes into a human-readable format
// function formatBytes(bytes) {
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//   if (bytes === 0) return '0 Byte';
//   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
//   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
// }

const compressImage = require('compress-images')
const axios = require('axios');
const fs = require('fs');
router.post("/category/:categoryId/userProduct", verifyAdminToken, isAdmin, async (req, res) => {
  // Get the category ID from the URL parameter
  const categoryId = req.params.categoryId.split(',');
  // Find the category in the database
  const categoriesID = await Category.find({_id : {$in : categoryId}});

  if (!categoriesID) {
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
    // Compress and save images
    const compressedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
      const fileName = imageUrl.split('/').pop();
      const filePath = `tmp/${fileName}`;
      const compressedPath = `tmp/compressed_${fileName}`;
      const compression = 50;

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
      fs.writeFileSync(filePath, imageData);

      return new Promise((resolve, reject) => {
        compressImage(filePath, compressedPath, { compress_force: false, statistic: true, autoupdate: true }, false,
          
          { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
          { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
          { svg: { engine: "svgo", command: "--multipass" } },
          { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },

          async function (error, completed, statistic) {
            if (error) {
              reject(error);
            } else {
              // console.log("-----------------------------------");
              // console.log(`File from: ${filePath}`);
              // console.log(`File to: ${compressedPath}`);
              // console.log(`Compression algorithm: [${statistic.algorithm}]`);
              // console.log(`Original size: [${(statistic.size_in / (1024 * 1024)).toFixed(2)}MB] | Compressed size: [${(statistic.size_output / (1024 * 1024)).toFixed(2)}MB] | Compression rate: [${((statistic.size_output / statistic.size_in) * 100).toFixed(2)}%]`);
              // console.log("-----------------------------------");
    //  if you want response same as termianl response 

              resolve(compressedPath);
            
            }
            fs.unlink(filePath, function (error) {
              if (error) console.error("Failed to unlink original image:", error);
            });
          }
        );
      });
    }));


    const discountPercentage = parseInt(req.body.discount.replace("%", ""));
    const price = parseFloat(req.body.price);
    const discountAmount = price * (discountPercentage / 100);
    const discountedPrice = price - discountAmount;
    const totalPrice = Math.round(discountedPrice);

    const usdExchangeRate = 0.74;
    const poundExchangeRate = 0.59;
    const usdTotalPrice = Math.round(totalPrice * usdExchangeRate);
    const poundTotalPrice = Math.round(totalPrice* poundExchangeRate);
    const usdPrice = Math.round(price * usdExchangeRate);
    const poundPrice = Math.round(price * poundExchangeRate);

    const {
      name, event, discount, type,
      excerpt, bodyShape, age, clothMeasurement,
      returnPolicy, publish,
    } = req.body;

    const colors = req.body.colors ? req.body.colors.split(",") : [];
    const materials = req.body.materials ? req.body.materials.split(",") : [];
    const stockValues = req.body.stockAvailability ? req.body.stockAvailability.split(",") : [];

    const variations = colors.map((color, colorIndex) => {
      const colorObj = {
        name: color,
        thumb:  imageUrls[colorIndex],
        
      };

      const materialsList = materials.map((material) => {
        return {
          name: material,
          slug: material.toLowerCase(),
          thumb: imageUrls[colorIndex],
          price: price,
          usdPrice : usdPrice,
          poundPrice : poundPrice,
        };
      });

      const sizesArray = req.body.sizes ? req.body.sizes.split(",").map((value) => value.trim()) : [];
      const sizesList = sizesArray.map((size, sizeIndex) => {
        const stockIndex = sizeIndex % stockValues.length;
        const stockAvailability = parseInt(stockValues[stockIndex]) || 0;

        return {
          name: size,
          stockAvailability: stockAvailability,
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

    const responses = [];

    for (const category of categoriesID) {
     
      const userProduct = new UserProduct({
        name, event, discount, type,
        categories:  category.name,
        tags:  category.name,
        thumbs: imageUrls.slice(0, 2),
        previewImages: imageUrls,
        excerpt, 
        bodyShape, 
        age, 
        clothMeasurement,
        returnPolicy, 
        publish,
        totalPrice, 
        usdTotalPrice, 
        poundTotalPrice, 
        variations,
      });
  
      try {
        // Save the userProduct to the database
        await userProduct.save();
  
        // Add the product to the category's products array
        category.userProducts.push(userProduct._id);
        await category.save();
  
        // Collect the response for this category
        responses.push({
          success: true,
          data: {
            userProduct,
          }
        });
      } catch (error) {
        console.log(error);
        // Collect the error response for this category
        responses.push({
          success: false,
          error: 'Server error',
        });
      }
    }
  
    // Send all the responses together after the loop
    res.status(201).json(responses);
  
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Server error', error });
  }

});




router.put('/category/:categoryId/userProduct/:productId', verifyAdminToken, isAdmin, async (req, res) => {
  const { productId} = req.params;
  // Get the category ID from the URL parameter
  const categoryId = req.params.categoryId.split(',');
  // Find the category in the database
  const categoriesID = await Category.find({_id : {$in : categoryId}});

  if (!categoriesID) {
    return res.status(404).send({ error: 'Category not found' });
  }

  // Find the category in the database
  const category = await Category.findById(categoryId);
  const product = await UserProduct.findById(productId);
  const categoryUserProduct = category.name;

  if (!product) {
    return res.status(404).send({ error: 'Product or Category not found' });
  }

  const files = req.files;

  let uploadPromises;
  if (req.files && req.files.photos) {
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
          );
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
          );
        })
      ];
    }
  } else {
    // If no new photos, use the existing photos from the product
    uploadPromises = product.previewImages.map((imageUrl) => Promise.resolve(imageUrl));
  }

  try {
    const imageUrls = await Promise.all(uploadPromises);


    // Compress and save images
    const compressedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
      const fileName = imageUrl.split('/').pop();
      const filePath = `tmp/${fileName}`;
      const compressedPath = `tmp/compressed_${fileName}`;
      const compression = 50;

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
      fs.writeFileSync(filePath, imageData);

      return new Promise((resolve, reject) => {
        compressImage(filePath, compressedPath, { compress_force: false, statistic: true, autoupdate: true }, false,
          
          { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
          { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
          { svg: { engine: "svgo", command: "--multipass" } },
          { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },

          async function (error, completed, statistic) {
            if (error) {
              reject(error);
            } else {
              // console.log("-----------------------------------");
              // console.log(`File from: ${filePath}`);
              // console.log(`File to: ${compressedPath}`);
              // console.log(`Compression algorithm: [${statistic.algorithm}]`);
              // console.log(`Original size: [${(statistic.size_in / (1024 * 1024)).toFixed(2)}MB] | Compressed size: [${(statistic.size_output / (1024 * 1024)).toFixed(2)}MB] | Compression rate: [${((statistic.size_output / statistic.size_in) * 100).toFixed(2)}%]`);
              // console.log("-----------------------------------");
    //  if you want response same as termianl response 

              resolve(compressedPath);
            
            }
            fs.unlink(filePath, function (error) {
              if (error) console.error("Failed to unlink original image:", error);
            });
          }
        );
      });
    }));

    // Retrieve the product
    const product = await UserProduct.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    const responses = [];
    for (const category of categoriesID){
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
    
  product.previewImages = imageUrls || product.previewImages;
  product.thumbs = imageUrls && imageUrls.slice(0, 2) || product.thumbs;
    }


    // // product.stockAvailability = req.body.stockAvailability || product.stockAvailability;



    // Update the previewImages and thumbs only if new images are being uploaded
   

    // Retrieve the updated product price
    const updatedPrice = parseFloat(req.body.price) || product.price;

    // Calculate the discount amount and discounted price based on the updated price
    const discountPercentage = parseInt(product.discount);
    const discountAmount = updatedPrice * (discountPercentage / 100);
    const discountedPrice = updatedPrice - discountAmount;
    const totalPrice = Math.round(discountedPrice);

    const usdExchangeRate = 0.74;
    const poundExchangeRate = 0.59;
    const usdTotalPrice = Math.round(totalPrice * usdExchangeRate);
    const poundTotalPrice = Math.round(totalPrice* poundExchangeRate);
    const usdPrice = Math.round(updatedPrice * usdExchangeRate);
    const poundPrice = Math.round(updatedPrice * poundExchangeRate);

    product.price = updatedPrice;
    product.totalPrice = totalPrice || product.totalPrice;
    product.usdTotalPrice = usdTotalPrice || product.usdTotalPrice
    product.poundTotalPrice = poundTotalPrice || product.poundTotalPrice

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
          thumb: product.thumbs[0],
          // thumb: color,
          
        };
        product.variations.forEach((variation) => {
          variation.materials.forEach((material) => {
            material.usdPrice = usdPrice;
            material.poundPrice = poundPrice;
          });
        });
      
        const materialsList = materials.map(material => {
          return {
            name: material,
            slug: material.toLowerCase(),
            thumb: product.thumbs[0],
            price: updatedPrice,
            //   product.totalPrice = totalPrice || product.totalPrice;
            usdPrice: usdPrice,
            poundPrice: poundPrice,
          };
        });
       
        const sizesList = sizesArray.map((size, sizeIndex) => {
          const stockIndex = sizeIndex % stockValues.length;
          const stockAvailability = parseInt(stockValues[stockIndex])
          return {
            name: size,
            stockAvailability: 0 || stockAvailability,
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
    try{

      const savedProduct = await product.save();

       // Update the reference to the updated product in the category
    const productIndex = category.userProducts.findIndex(p => p._id.toString() === productId);
    if (productIndex !== -1) {
      category.userProducts[productIndex] = savedProduct._id;
    }
     await category.save();

    responses.push({
        success: true,
        data: {
          userProduct: savedProduct
        }
    });
    } catch ( err ){
      console.log(err);
        // Collect the error response for this category
        responses.push({
          success: false,error: 'Server error', err,
        });
     }
    // Save the updated product
    res.status(201).json(responses);
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Backend Server Error: " + error
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


module.exports = router;