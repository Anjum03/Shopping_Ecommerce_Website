
require('dotenv').config();

const app = require("express")();
const PORT = process.env.PORT  || 4000;

//using DB
const connectDB = require('./db/connection');
connectDB();


//using cloudinary
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    useTempFiles:true
}))


//using cors

const cors = require("cors");
app.use(cors());

//using body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

//using routes
const adminRoute = require("./routes/adminRoute");
app.use('/', adminRoute);

const categoryRoute = require("./routes/categoryRoute");
app.use('/', categoryRoute);

const productRoute = require("./routes/productRoute");
app.use('/', productRoute);

const purchaseRoute = require("./routes/purchaseRoute");
app.use('/', purchaseRoute);


const userRoute = require("./routes/userRoute");
app.use('/', userRoute);

const userQueryRoute = require("./routes/userEmailQurey");
app.use('/', userQueryRoute);

const cartRoute = require("./routes/cartRoute");
app.use('/', cartRoute);

const bannerRoute = require("./routes/bannerRoute");
app.use('/', bannerRoute);

app.listen(PORT, ()=>{
    console.log(`Server is Started.... :)`)
})