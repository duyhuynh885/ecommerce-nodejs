'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError } = require('../core/error.response');

const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
    /**
     * 1 - check email i dbs
     * 2 - match password
     * 3 - create AT vs RT and save
     * 4 - generate tokens
     * 5 - get data return login
     * @param {email,password,refreshToken} param0
     */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError('Shop not registered!');

        // 2
        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError('Authentication Error!');

        //3
        // created privateKey, publicKey
        const privateKey = crypto
            .randomBytes(64)
            .toString('hex');
        const publicKey = crypto
            .randomBytes(64)
            .toString('hex');

        const tokens = await createTokenPair(
            { userId: foundShop._id, email },
            privateKey,
            publicKey
        );

        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop,
            }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        // step 1: check email exists
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // created privateKey, publicKey
            const privateKey = crypto
                .randomBytes(64)
                .toString('hex');
            const publicKey = crypto
                .randomBytes(64)
                .toString('hex');

            // save collection key store
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError('Error: Public key error!');
            }

            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );

            return {
                shop: getInfoData({
                    fields: ['_id', 'name', 'email'],
                    object: newShop,
                }),
                tokens,
            };
        }

        return null;
    };
}

module.exports = AccessService;
