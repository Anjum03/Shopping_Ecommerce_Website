

require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const PrimeCollection = require('../model/primeCollectionModel');
const { verifyToken, isAdmin } = require('../middleware/token');

//Define multer storage and file filter
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");

    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-"  + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
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



//create primeCollection
router.post('/primeCollection', upload.single('imageUrl'),verifyToken,isAdmin, async(req,res)=>{
    req.body.imageUrl = req.file.path
    try{
        const primeCollection = new PrimeCollection({
        name: req.body.name,
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

    const newPrimeCollection = await primeCollection.save();
    console.log(newPrimeCollection);
    res.status(201).json({ success: true, data: newPrimeCollection });

    }catch(error){
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//   Get all clothing categories
router.get('/primeCollection',  async(req,res)=>{
    try{

        const primeCollection = await PrimeCollection.find();
        console.log(primeCollection);
        res.status(200).json({ success: true, data: primeCollection});

    } catch(error){
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//   Get by ID clothing categories
router.get('/primeCollection/:id', async(req,res)=>{
    try{

        const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Invalid request: ID is missing' });
    }
        const primeCollection = await PrimeCollection.findById(id);

        if (!primeCollection) {
            return res.status(404).json({ success: false, error: 'Prime collection not found' });
          }
        console.log(primeCollection);
        
        res.status(200).json({ success: true, data: primeCollection});

    } catch(error){
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//update and  Update an existing clothing prime Collection  by ID
router.put("/primeCollection/:id", verifyToken,isAdmin, upload.single("imageUrl"), async (req, res) => {
    try {
        const primeCollection = await PrimeCollection.findById(req.params.id);
        if (primeCollection == null) {
            console.log("Prime Collection not Found");
            return res.status(404).json({ message: "Prime Collection not found" });
        }
        primeCollection.name = req.body.name || primeCollection.name;
        primeCollection.imageUrl = req.body.imageUrl || primeCollection.imageUrl;
        primeCollection.fabric = req.body.fabric || primeCollection.fabric;
        primeCollection.event = req.body.event || primeCollection.event;
        primeCollection.categories = req.body.categories || primeCollection.categories;
        primeCollection.size = req.body.size || primeCollection.size;
        primeCollection.bodyShape = req.body.bodyShape || primeCollection.bodyShape;
        primeCollection.color = req.body.color || primeCollection.color;
        primeCollection.clothMeasurement = req.body.clothMeasurement || primeCollection.clothMeasurement;
        primeCollection.rating = req.body.rating || primeCollection.rating;
        primeCollection.stockAvaliability = req.body.stockAvaliability || primeCollection.stockAvaliability;
        primeCollection.age = req.body.age || primeCollection.age;
        primeCollection.price = req.body.price || primeCollection.price


        if (req.file) {
            console.log(req.file.path);
            primeCollection.imageUrl = req.file.path;
        }

        const upadtedPrimeCollection = await primeCollection.save();
        console.log(upadtedPrimeCollection);
        res.status(201).json({ success: true, message: `Prime Collection Update`,data: upadtedPrimeCollection });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//update and  Update an existing clothing prime Collection  by all
router.put("/primeCollection", verifyToken,isAdmin, upload.single("imageUrl"), async (req, res) => {
    try {
        const primeCollection = await PrimeCollection.find();
        if (primeCollection == null) {
            console.log("Prime Collection not Found");
            return res.status(404).json({ message: "Prime Collection not found" });
        }
        primeCollection.name = req.body.name || primeCollection.name;
        primeCollection.imageUrl = req.body.imageUrl || primeCollection.imageUrl;
        primeCollection.fabric = req.body.fabric || primeCollection.fabric;
        primeCollection.event = req.body.event || primeCollection.event;
        primeCollection.categories = req.body.categories || primeCollection.categories;
        primeCollection.size = req.body.size || primeCollection.size;
        primeCollection.bodyShape = req.body.bodyShape || primeCollection.bodyShape;
        primeCollection.color = req.body.color || primeCollection.color;
        primeCollection.clothMeasurement = req.body.clothMeasurement || primeCollection.clothMeasurement;
        primeCollection.rating = req.body.rating || primeCollection.rating;
        primeCollection.stockAvaliability = req.body.stockAvaliability || primeCollection.stockAvaliability;
        primeCollection.age = req.body.age || primeCollection.age;
        primeCollection.price = req.body.price || primeCollection.price


        if (req.file) {
            console.log(req.file.path);
            primeCollection.imageUrl = req.file.path;
        }

        const upadtedPrimeCollection = await primeCollection.save();
        console.log(upadtedPrimeCollection);
        res.status(201).json({ success: true, message:`Prime Collection Update`,data: upadtedPrimeCollection });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



//delete and Delete a clothing prime Collection 
router.delete("/primeCollection/:id", verifyToken,isAdmin, async (req, res) => {
    try {
        
        const primeCollection = await PrimeCollection.findById(req.params.id);

        if (primeCollection == null) {
            console.log("Prime Collection not Found")
            return res.status(404).json({ message: "Prime Collection not found" });
        }

        await primeCollection.del();
        console.log("Prime Collection  Deleted .................");
        res.status(201).json({ success: true, data: "Prime Collection  Delted ..." });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });

    }
})


module.exports = router ;