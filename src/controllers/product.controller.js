'use strict';

const ProductService = require('../services/product.service');
const { SUCCESS } = require('../core/success.response');

class ProductController {
    createProduct = async (req, res, next) => {
        new SUCCESS({
            message: 'Get new Product success!',
            metadata: await ProductService.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };
}

module.exports = new ProductController();
