var express = require('express');
var router = express.Router();
var ProductController = require('../controller/product-controller'); 

/* GET home page. */
router.get('/product', ProductController.listProduct);
router.get('/shop-info', ProductController.getShopInfo);

module.exports = router;
