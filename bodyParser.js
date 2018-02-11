'use strict';

const Promise = require("bluebird");
const LinkStatus = require('./linkStatus');
const config = require('./config');

const BodyParser = {
    parse: (body) => {
        // console.log(body);
        if (body.indexOf(config.not_found_text) !== -1) {
            return Promise.resolve(LinkStatus.NOT_FOUND);
        }
    
        if (body.indexOf(config.not_authenticated_text) !== -1) {
            return Promise.resolve(LinkStatus.NOT_AUTHENTICATED);
        }
    
        return Promise.resolve(LinkStatus.SUCESSFUL);
    }    
};

module.exports = BodyParser;