require('dotenv').config();
const express = require('express');
const router = express.Router();
const Category = require('../model/categoryModel');
const { verifyToken, isAdmin } = require('../middleware/token');
const multer = require("multer");

//Define multer storage and file filter
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");

    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG are allowed.'), false);
    }
};

// Define multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
    },
    fileFilter: fileFilter,
});


//Define route for managing clothing categories.
//   Get all clothing categories
router.get("/category", async (req, res) => {
    try {
        const categories = await Category.find();
        console.log(categories);
        res.status(200).json({ success: true, data: categories });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//   Create a new clothing category
router.post("/category", verifyToken,isAdmin, upload.single("imageUrl"), async (req, res) => {
    req.body.imageUrl = req.file.path
    console.log(req.body.imageUrl, req.file.path)
    const category = new Category({
        name: req.body.name,
        desc: req.body.desc,
        imageUrl: req.body.imageUrl,
        fabric: req.body.fabric,
        event: req.body.event,
        categories: req.body.categories,
        size: req.body.size,
        bodyShape: req.body.bodyShape,
        color: req.body.color,
        clothMeasurement: req.body.clothMeasurement,
        rating: req.body.rating,
        stockAvaliability: req.body.stockAvaliability,
        age: req.body.age,
        price: req.body.price

    });

    try {
        
        const newCategory = await category.save();
        console.log(newCategory);
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//update and  Update an existing clothing category y ID

router.put("/category/:id", verifyToken,isAdmin, upload.single("imageUrl"), async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id);
        if (category == null) {
            console.log("Category not Found");
            return res.status(404).json({ message: "Category not found" });
        }
        
        category.name = req.body.name || category.name;
        category.desc = req.body.desc || category.desc;
        category.fabric = req.body.fabric || category.fabric;
        category.event = req.body.event || category.event;
        category.categories = req.body.categories || category.categories;
        category.size = req.body.size || category.size;
        category.bodyShape = req.body.bodyShape || category.bodyShape;
        category.color = req.body.color || category.color;
        category.clothMeasurement = req.body.clothMeasurement || category.clothMeasurement;
        category.rating = req.body.rating || category.rating;
        category.stockAvaliability = req.body.stockAvaliability || category.stockAvaliability;
        category.age = req.body.age || category.age;
        category.price = req.body.price || category.price
        
        
        if (req.file) {
                console.log(req.file.path);
                category.imageUrl = req.file.path;
            }
        
        const updatedCategory = await category.save();
        console.log(updatedCategory);
        res.status(201).json({ success: true, data: updatedCategory });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//delete and Delete a clothing category

router.delete("/category/:id", verifyToken,isAdmin, async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (category == null) {
            console.log("Category not Found")
            return res.status(404).json({ message: "Category not found" });
        }

        await category.deleteOne();
        
        console.log("Category Deleted .................");
        res.status(201).json({ success: true, data: "Category Delted ..." });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });

    }
})






module.exports = router;