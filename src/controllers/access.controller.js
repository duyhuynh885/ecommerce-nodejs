'use strict';

const AccessService = require('../services/access.service');
const { CREATED, SUCCESS } = require('../core/success.response');

class AccessController {
    handleRefreshToken = async (req, res, next) => {
        new SUCCESS({
            message: 'Get tokens success!',
            metadata: await AccessService.handlerRefreshToken(
                req.body.refreshToken
            ),
        }).send(res);
    };

    login = async (req, res, next) => {
        new SUCCESS({
            message: 'Login Success!',
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };

    logout = async (req, res, next) => {
        new SUCCESS({
            message: 'Logout Success!',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };
}

module.exports = new AccessController();
