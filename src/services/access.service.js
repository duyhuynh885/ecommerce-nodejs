'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require('../core/error.response');

const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
    /**
     * Check this token used?
     * @param {*} refreshToken
     */
    static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyByUserId(userId);
            throw new ForbiddenError(
                'Something wrong happen!! Please try login'
            );
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered');
        }

        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered');

        // create 1 cap moi
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user,
            tokens,
        };
    };

    /**
     * Check this token used?
     * @param {*} refreshToken
     */
    static handlerRefreshToken = async (refreshToken) => {
        // check xem token nay da duoc su dung chua?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );

        // neu co
        if (foundToken) {
            // decode
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );
            console.log({ userId, email });
            // xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyByUserId(userId);
            throw new ForbiddenError(
                'Something wrong happen!! Please try login'
            );
        }

        // chua co
        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new AuthFailureError('Shop not registered');

        // verify Token
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );

        // check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered');

        // create 1 cap moi
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop,
            }),
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return {
            success: true,
            _id: delKey._id,
        };
    };

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
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair(
            { userId: foundShop._id, email },
            publicKey,
            privateKey
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
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

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
