require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require('../model/categoryModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2;
const UserProduct = require("../model/userProductModel")
const Product = require("../model/productModel");

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//   Get by all clothing product
//view all category and product by publish data
router.get("/category/:categoryId/product", async (req, res) => {
    try {
        let publish;
        let product;
        if (publish = true) {
            product = await Product.find({ publish: 'true' });
            product = await UserProduct.find({ publish: 'true' });
        }
        res.status(200).json({ success: true, message: `All Product of Publish Data is Here ..`, data: product });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /category - Get all categories
router.get("/category/:categoryId/products", verifyAdminToken, isAdmin, async (req, res) => {
    try {

        const product = await Product.find();
        const userProduct = await UserProduct.find();
        res.status(200).json({ success: true, message: `All Prodcut Here ..`, data: product , userProduct});

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});




//   Get by ID clothing product
router.get('/category/:categoryId/product/:productId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const productId = req.params.productId;

        const category = await Category.findById(categoryId);
        const product = await Product.findById(productId);

        if (!category || !product) {
            return res.status(404).json({ success: false, error: `Category and Product not found with id ${categoryId} and ${productId}` });
        }

        res.status(200).json({ success: true, data: product });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



// Add a new product to a category
router.post("/category/:categoryId/product", verifyAdminToken, isAdmin, async (req, res) => {
    // Get the category ID from the URL parameter
    const categoryId = req.params.categoryId;
    // Find the category in the database
    const category = await Category.findById(categoryId);

    if (!category) {
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

        const discountPercentage = parseInt(req.body.discount.replace("%", ""));
        const price = parseFloat(req.body.price);
        const discountAmount = price * (discountPercentage / 100);
        const discountedPrice = price - discountAmount;
        const totalPrice = Math.round(discountedPrice);
        
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            imageUrl: imageUrls,
            fabric: req.body.fabric,
            event: req.body.event,
            category: category._id,
            size: req.body.size,
            bodyShape: req.body.bodyShape,
            color: req.body.color,
            clothMeasurement: req.body.clothMeasurement,
            returnPolicy: req.body.returnPolicy,
            stockAvailability: req.body.stockAvailability,
            // stockAvailability: stockAvailability,
            age: req.body.age,
            discount: `${discountPercentage}%`, // Add the percentage symbol here
            price: price,
            totalPrice: totalPrice,
            publish: req.body.publish
        });
        
        // Save the product to the database
        const stockAvailability = Array.isArray(req.body.stockAvailability) ? req.body.stockAvailability.map(stock => parseInt(stock)) : [];
        const savedProduct = await newProduct.save();
        // console.log(`saved-Product :   `, savedProduct)
        
        const variations = [];
        for (let i = 0; i < savedProduct.color.length; i++) {
            variations.push({
                // id: savedProduct.id,
                title: savedProduct.name,
                color: {
                    name: savedProduct.color[i],
                    thumb: savedProduct.imageUrl[i],
                    code: savedProduct.color[i]
                },
                materials: savedProduct.fabric.map(fabric => {
                    return {
                        name: fabric,
                        slug: fabric,
                        thumb: savedProduct.imageUrl[i],
                        price: savedProduct.totalPrice
                    };
                }),
                sizes: savedProduct.size.map(size => {
                    return {
                        name: size,
                               stockAvailability: stockAvailability.length > i ? stockAvailability[i] : 0
                    };
                })
            });
        }
        

// create a new user product using the saved product's data
        const newUserProduct = new UserProduct({
        productId: savedProduct.id, // --------------------->  no issue
        name: savedProduct.name,
        discount: savedProduct.discount,
        type: ["trending", "featured"],
        // categories:savedProduct.category,
        categories:[category],
        tags: savedProduct.category,
        thumbs:savedProduct.imageUrl,
        previewImages: savedProduct.imageUrl,
        excerpt: savedProduct.description,
        bodyShape:savedProduct.bodyShape,
        returnPolicy:savedProduct.returnPolicy,
        clothMeasurement:savedProduct.clothMeasurement,
        variations : variations,
        publish:savedProduct.publish

        }); 
        //save the new user product to the user database
       await newUserProduct.save();

       // Convert the user product object to a JSON string
const userProductString = JSON.stringify(newUserProduct);

        // Add the product to the category's products array
        category.products.push(savedProduct._id);
        await category.save();
        console.log('Product added Successfully')
        // Send the new product object as the response
        // res.status(201).json({ success: true, data: newProduct.toObject(), }); // Add the percentage symbol here
        res.status(201).json({ success: true,
             data:  newProduct,
              userProductString: userProductString}); // Add the percentage symbol here

    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});



//update and  Update an existing clothing product y ID
router.put('/category/:categoryId/product/:productId', verifyAdminToken, isAdmin, async (req, res) => {

    try {

        // Get the category ID from the URL parameter
        const { productId, categoryId } = req.params;

        // Find the category in the database
        const category = await Category.findById(categoryId);
        const product = await Product.findById(productId);

        if (!category || !product) {
            return res.status(404).send({ error: 'Product or Category not found' });
        }

        // Check if new image files are being uploaded
        let newImageUrls = product.imageUrl;
        if (req.files && req.files.photos) {
            const files = req.files.photos;
            let uploadPromises;
            if (Array.isArray(files)) {
                uploadPromises = files.map((file) => {
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
            } else {
                uploadPromises = [
                    new Promise((resolve, reject) => {
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
                    }),
                ];
            }
            newImageUrls = await Promise.all(uploadPromises);
        }

        // Update the product fields
        product.name = req.body.name || product.name;
        product.publish = req.body.publish || product.publish;
        product.description = req.body.description || product.description;
        product.imageUrl = newImageUrls || product.imageUrl;
        product.fabric = req.body.fabric || product.fabric;
        product.event = req.body.event || product.event;
        product.category = req.body.category || product.category;
        product.size = req.body.size || product.size;
        product.bodyShape = req.body.bodyShape || product.bodyShape;
        product.color = req.body.color || product.color;
        product.clothMeasurement =
            req.body.clothMeasurement || product.clothMeasurement;
        product.returnPolicy = req.body.returnPolicy || product.returnPolicy;
        product.stockAvailability =
            req.body.stockAvailability || product.stockAvailability;
        product.age = req.body.age || product.age;
        product.discount = req.body.discount || product.discount;
        product.price = parseFloat(req.body.price) || product.price;

        // Recalculate the total price if the price or discount changes
        const price = product.price;
        const discountPercentage = parseInt(product.discount.replace("%", ""));
        const discountAmount = price * (discountPercentage / 100);
        const discountedPrice = price - discountAmount;
        const totalPrice = Math.round(discountedPrice);

        product.totalPrice = totalPrice;

        const savedProduct = await product.save();

// update the user product object
const variations = [];
for (let i = 0; i < savedProduct.color.length; i++) {
  variations.push({
    title: savedProduct.name,
    color: {
      name: savedProduct.color[i],
      thumb: savedProduct.imageUrl[i],
      code: savedProduct.color[i]
    },
    materials: savedProduct.fabric.map(fabric => {
      return {
        name: fabric,
        slug: fabric,
        thumb: savedProduct.imageUrl[i],
        price: savedProduct.totalPrice
      };
    }),
    sizes: savedProduct.size.map(size => {
      return {
        name: size,
        stockAvailability: req.body.stockAvailability && req.body.stockAvailability[i] ? parseInt(req.body.stockAvailability[i]) : 0
        // stockAvailability: req.body.stockAvailability.length > i ? parseInt(req.body.stockAvailability[i]) : 0

      };
    })
  });
}

const userProduct = await UserProduct.findOne({ id: savedProduct.id });
if (userProduct) {
  userProduct.name = savedProduct.name;
  userProduct.discount = savedProduct.discount;
  userProduct.category = savedProduct.category;
  userProduct.tags = savedProduct.category;
  userProduct.thumbs = savedProduct.imageUrl;
  userProduct.previewImages = savedProduct.imageUrl;
  userProduct.excerpt = savedProduct.description;
  userProduct.bodyShape = savedProduct.bodyShape;
  userProduct.returnPolicy = savedProduct.returnPolicy;
  userProduct.clothMeasurement = savedProduct.clothMeasurement;
  userProduct.variations = variations;

  await userProduct.save();
}
        savedProduct.discount = `${savedProduct.discount}%`;

        // Update the product in the category's products array
        const productIndex = category.products.findIndex((p) => p._id.toString() === productId);
        category.products[productIndex] = savedProduct._id;

        await category.save();
        // Include the percentage symbol in the discount field of the response

        res.status(200).json({ success: true, data: savedProduct });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//delete and Delete a clothing product with imgs
router.delete('/category/:categoryId/product/:productId', verifyAdminToken, isAdmin, async (req, res) => {
    try {
      const { productId, categoryId } = req.params;
  
      // Find the category in the database
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).send({ error: 'Category not found' });
      }
  
      // Find the product in the category's products array
      const productIndex = category.products.findIndex((product) => product._id.toString() === productId);
  
      if (productIndex === -1) {
        return res.status(404).send({ error: 'Product not found' });
      }
  
      // Get the product to be deleted
      const deletedProduct = category.products[productIndex];
  
      // Remove the product from the category's products array
      category.products.splice(productIndex, 1);
  
      // Delete the product from the product database
     const adminProduct =  await Product.findByIdAndDelete(productId);

      // Delete the product from the user products
    
    const websiteProduct = await UserProduct.findOne({productId});
    if (websiteProduct) {
      await UserProduct.deleteOne({ productId: productId });
    }
  
      // Delete the images from Cloudinary
      if (deletedProduct.imageUrl && deletedProduct.imageUrl.length > 0) {
        for (let i = 0; i < deletedProduct.imageUrl.length; i++) {
          const publicId = deletedProduct.imageUrl[i].split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
  
      // Save the updated category to the database
      await category.save();
  
      res.status(200).json({ success: true,
         msg: 'Product removed from category and user products successfully' ,
        data: adminProduct, websiteProduct  });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  



module.exports = router;