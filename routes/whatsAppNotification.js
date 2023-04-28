

const wbm = require('wbm');
require('dotenv').config();
const express = require('express');
const router = express.Router();
const  { verifyAdminToken, isAdmin, } = require('../middleware/token');

wbm.start().then(async () => {
    const phones = ['5535988841854', '35988841854', '5535988841854'];
    const message = 'Good Morning.';
    await wbm.send(phones, message);
    await wbm.end();
}).catch(err => console.log(err));


module.exports = router