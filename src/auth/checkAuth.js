'use strict';

const { findById } = require('../services/apikey.service');
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
};
const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: 'Forbidden Error',
            });
        }

        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden Error',
            });
        }
        req.objKey = objKey;
        return next();
    } catch (error) {
        console.log('🚀 ~ file: checkAuth.js:27 ~ apiKey ~ error:', error);
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission Dined',
            });
        }

        const validPermission = req.objKey.permissions.includes(permission);
        console.log("🚀 ~ file: checkAuth.js:40 ~ return ~ req.objKey.permissions:", req.objKey.permissions)

        if (!validPermission) {
            return res.status(403).json({
                message: 'Permission Dined',
            });
        }

        return next();
    };
};

module.exports = {
    apiKey,
    permission,
};