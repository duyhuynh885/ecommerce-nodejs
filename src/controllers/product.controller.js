'use strict';

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');

const { SUCCESS } = require('../core/success.response');

class ProductController {
    createProduct = async (req, res, next) => {
        // new SUCCESS({
        //     message: 'Get new Product success!',
        //     metadata: await ProductService.createProduct(
        //         req.body.product_type,
        //         {
        //             ...req.body,
        //             product_shop: req.user.userId,
        //         }
        //     ),
        // }).send(res);

        // New v2
        new SUCCESS({
            message: 'Get new Product success!',
            metadata: await ProductServiceV2.createProduct(
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
