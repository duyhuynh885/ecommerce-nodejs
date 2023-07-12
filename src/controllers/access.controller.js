'use strict';

const AccessService = require('../services/access.service');
const { CREATED, SUCCESS } = require('../core/success.response');

class AccessController {
    login = async (req, res, next) => {
        new SUCCESS({
            message: 'Login Success!',
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    signUp = async  (req, res, next) => {
        new CREATED({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };
}

module.exports = new AccessController();
