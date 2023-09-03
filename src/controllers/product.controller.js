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

    /**
     * @description Get all Draft for shop
     * @param { Number } limit
     * @param { Number } skip
     * @returns { JSON }
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SUCCESS({
            message: 'Get list Draft success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description Get all Published for shop
     * @param { Number } limit
     * @param { Number } skip
     * @returns { JSON }
     */
    getAllPublishedForShop = async (req, res, next) => {
        new SUCCESS({
            message: 'Get list Published success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description Publish product by product_id
     * @param { String } product_shop
     * @param { String } product_id
     * @returns { JSON }
     */
    publishProductByShop = async (req, res, next) => {
        new SUCCESS({
            message: 'Publish product success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };

    /**
     * @description UnPublish product by product_id
     * @param { String } product_shop
     * @param { String } product_id
     * @returns { JSON }
     */
    unPublishProductByShop = async (req, res, next) => {
        new SUCCESS({
            message: 'UnPublish product success!',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };

    /**
     * @description Get list search product by product_id
     * @param { String } keySearch
     * @returns { JSON }
     */
    getListSearchProduct = async (req, res, next) => {
        new SUCCESS({
            message: 'Get list search product success!',
            metadata: await ProductServiceV2.searchProduct(req.params),
        }).send(res);
    };
}

module.exports = new ProductController();
