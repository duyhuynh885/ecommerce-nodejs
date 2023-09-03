'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_description: String,
        product_price: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_type: {
            type: String,
            required: true,
            enum: ['Electronics', 'Clothing', 'Furniture'],
        },
        product_shop: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Shop',
        },
        product_attributes: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

// define the product type = clothing

const clothingSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    { collection: 'Clothes', timestamps: true }
);

// define the product type = electronic

const electronicSchema = new Schema(
    {
        manufacturer: { type: String, required: true },
        model: String,
        color: String,
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    { collection: 'Electronics', timestamps: true }
);

// define the product type = electronic

const furnitureSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    { collection: 'Furnitures', timestamps: true }
);

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronics: model('Electronic', electronicSchema),
    clothing: model('Clothing', clothingSchema),
    furniture: model('Furniture', furnitureSchema),
};
