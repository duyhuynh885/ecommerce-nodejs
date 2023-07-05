'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestRequestError } = require('../core/error.response');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        // step 1: check email exists
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestRequestError('Error: Shop already registered!');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            const { privateKey, publicKey } = crypto.generateKeyPairSync(
                'rsa',
                {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1', // Public key CryptoGraphy Standards!
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1', // Public key CryptoGraphy Standards!
                        format: 'pem',
                    },
                }
            );

            // created privateKey, publicKey

            // save collection key store
            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
            });

            if (!publicKeyString) {
                throw new BadRequestRequestError('Error: Public key error!');
            }

            const publicKeyObject = crypto.createPublicKey(publicKeyString);

            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKeyObject,
                privateKey
            );

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ['_id', 'name', 'email'],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }

        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
