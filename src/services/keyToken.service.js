'use strict';

const keytokenModel = require('../models/keytoken.model');

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey: publicKey,
            // });
            // return tokens ? tokens.publicKey : null;

            const filter = { user: userId };
            const update = {
                publicKey,
                privateKey,
                refreshTokensUsed: [],
                refreshToken,
            };
            const options = { upsert: true, new: true };

            const tokens = await keytokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: userId });
    };

    static removeKeyById = async (id) => {
        return await keytokenModel.findByIdAndRemove(id);
    };

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel
            .findOne({
                refreshTokensUsed: refreshToken,
            })
            .lean();
    };

    static deleteKeyByUserId = async (userId) => {
        return await keytokenModel.deleteOne({
            user: userId,
        });
    };

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({
            refreshToken,
        });
    };
}

module.exports = KeyTokenService;
