require('dotenv').config();
const express = require('express');
const router = express.Router();
const Banner = require("../model/bannerModel");
const { verifyAdminToken, isAdmin } = require('../middleware/token');
const cloudinary = require('cloudinary').v2


//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



//create banner
router.post('/banner', verifyAdminToken, isAdmin, async (req, res) => {

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

        const banner = new Banner({

            name: req.body.name,
            description: req.body.description,
            imageUrl: imageUrls,
           publish: req.body.publish
        });

        const newBanner = await banner.save();

        // Send the new product object as the response
        res.status(201).json({ success: true, data: newBanner });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});



//update banner
router.put('/banner/:id', verifyAdminToken, isAdmin, async (req, res) => {

    const { id: bannerId } = req.params;

    try {

        const banner = await Banner.findById(bannerId);

        if (!banner) {
            return res.status(404).json({ success: false, error: "Banner not found" });
        }
        // Check if new image files are being uploaded
        let newImageUrls = banner.imageUrl;
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
        // Update the banner fields
        banner.name = req.body.name || banner.name;
        banner.publish = req.body.publish || banner.publish;
        banner.description = req.body.description || banner.description;
        banner.imageUrl = newImageUrls || banner.imageUrl;

        const updatedBanner = await banner.save();
        res.status(200).json({ success: true, data: updatedBanner });

    }
    catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});



//delete banner
router.delete('/banner/:id', verifyAdminToken, isAdmin, async (req, res) => {

    try{
        
        const bannerId = req.params.id;
    
        const banner = await Banner.findById(bannerId);
    
        if (!banner) {
            return res.status(404).json({ success: false, error: "Banner not found" });
        }
    
        // Delete the images from Cloudinary
    
        if (banner.imageUrl && banner.imageUrl.length > 0) {
            for (let i = 0; i < banner.imageUrl.length; i++) {
                const publicId = banner.imageUrl[i].split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        }
    
       // Delete the banner from the banner database
       await Banner.findByIdAndDelete(bannerId);
       res.status(200).json({ success: true, data: 'Banner removed from DB successfully' });
    }
    catch (error) {
        res.status(500).json(error);
    }
});


//view all banner by publish data
router.get('/banner', async (req, res) => {
    try {
      const banners = await Banner.find({ publish: true });
  
      if (banners.length > 1) {
        res.status(200).json({ success: true, message: 'Only one banner can be published' });
      } else {
        res.status(200).json({ success: true, data: banners });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  
// router.get('/banner',  async(req,res)=>{
//     try{
// let publish ;
//         let banners ;
//         if( publish = true ){

//              banners = await Banner.find({ publish: 'true' });
//         }

//         res.status(200).json({ success: true, data: banners});
//     }catch (error) {
//         res.status(500).json({ success: false, error: 'Server error' });
//     }

// });



//get all banner with pagination
router.get('/banners',verifyAdminToken, isAdmin,  async(req,res)=>{
    try{
        const banner = await Banner.find();
        res.status(200).json({ success: true, data: banner });
        
    }catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }

});



//get by ID banner
router.get('/banner/:id',  async(req,res)=>{
    try{

    const bannerId = req.params.id;
    const banner = await Banner.findById(bannerId);
    res.status(200).json({ success: true, data: banner });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
})

module.exports = router;