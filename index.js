
require('dotenv').config();

const app = require("express")();
const PORT = process.env.PORT || 4001;

//using DB
const connectDB = require('./db/connection');
connectDB();


//using cloudinary
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    useTempFiles: true
}))


//using cors

const cors = require("cors");
app.use(cors());

//using body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//using routes
const adminRoute = require("./routes/adminRoute");
app.use('/', adminRoute);

const categoryRoute = require("./routes/categoryRoute");
app.use('/', categoryRoute);

// const productRoute = require("./routes/productRoute");
// app.use('/', productRoute);

const purchaseRoute = require("./routes/purchaseRoute");
app.use('/', purchaseRoute);

const userRoute = require("./routes/userRoute");
app.use('/', userRoute);

const notificationRoute = require("./routes/whatsAppNotification");
app.use('/', notificationRoute);

const userQueryRoute = require("./routes/userEmailQurey");
app.use('/', userQueryRoute);

const wishlistRoute = require("./routes/wishListRoute");
app.use('/', wishlistRoute);

const bannerRoute = require("./routes/bannerRoute");
app.use('/', bannerRoute);

const paymentRoute = require("./routes/paymentRoute");
app.use('/', paymentRoute);

const mariamRajRoute = require("./routes/MariamRajProductROute");
app.use('/', mariamRajRoute);

const aboutUsEmailRoute = require("./routes/aboutUsEmail");
app.use('/', aboutUsEmailRoute);


app.listen(PORT, () => {
    console.log(`Server is Started.... :)   ${PORT}`)
})