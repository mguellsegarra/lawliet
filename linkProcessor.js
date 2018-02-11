'use strict';

const Promise = require("bluebird");
const LinkStatus = require('./linkStatus');
const config = require('./config');
const request = require("request-promise");
const BodyParser = require('./bodyParser');
const chalk = require('chalk');
const ora = require('ora');

let spinner;
let urlCounter = 0;

var requestOptions = {
    proxy: config.proxy,
    strictSSL: config.strictSSL,
    resolveWithFullResponse: true
};

const LinkProcessor = {
    start: (fileUrls, options) => {
        const keys = Object.getOwnPropertyNames(fileUrls);
        spinner = ora('Starting...').start();
        let fileCounter = 0;
        let fileUrlsStatus = {};

        return Promise.mapSeries(keys, (keyItem) => {
            fileCounter += 1;
            spinner.text = "Checking urls in file " + fileCounter + " of " + options.totalFiles;
            Object.assign(options, { fileCounter: fileCounter });
            return processFileUlrs(fileUrls[keyItem], options)
                .then((statusUrls) => {
                    fileUrlsStatus[keyItem] = statusUrls;
                });
        })
            .then(() => {
                spinner.stop();
                return Promise.resolve(fileUrlsStatus);
            });
    }
};

const processFileUlrs = (urls, options) => {
    let checkedUrls = [];

    return Promise.mapSeries(urls, (url) => {
        urlCounter += 1;
        spinner.text = "Checking URL " + chalk.bold(urlCounter + "/" + options.totalUrls) + chalk.gray(" (file " + options.fileCounter + "/" + options.totalFiles + ") : " + url);

        return getLinkStatus(url, options)
            .then((response) => {
                checkedUrls.push({
                    "url": url,
                    "status": response.status,
                    "code": response.code
                });
                return Promise.resolve();
            })
    }).then(() => {
        return Promise.resolve(checkedUrls);
    });
};

const getLinkStatus = (link, options) => {
    Object.assign(options, requestOptions);
    Object.assign(options, { url: link });
    return request.get(prepareRequestOptions(options))
        .then((response) => {
            if (response.statusCode !== 200) {
                return error(response, link);
            } else {
                return BodyParser.parse(response.body).then(status => {
                    return evaluateLink(status, link, response.statusCode);
                });
            }
        })
        .catch((response) => {
            return error(response, link);
        })
};

const evaluateLink = (status, link, statusCode) => {
    if (status === LinkStatus.SUCESSFUL) {
        console.log(chalk.green("\n✅  Success! " + link));
    } else if (status === LinkStatus.NOT_AUTHENTICATED) {
        console.log("\n⛔️  Seems not authenticated: " + link);
    } else if (status === LinkStatus.NOT_FOUND) {
        return notFoundLink(link);
    }
    return Promise.resolve({
        status: status,
        code: statusCode
    });
};

const notFoundLink = (link) => {
    console.log(chalk.red.bold("\n🕵️  Link not found! " + link));
    return Promise.resolve({
        status: LinkStatus.NOT_FOUND,
        code: 404
    });
};

const error = (response, url) => {
    let errorCode = response.statusCode ? response.statusCode : response.error.code;

    if (errorCode === 404) {
        return notFoundLink(url);
    } else {
        console.log("\n❌  Error " + errorCode + " in " + url);
        return Promise.resolve({
            status: LinkStatus.ERROR,
            code: errorCode
        });
    }
};

const prepareRequestOptions = (options) => {
    let requestOptions = {};
    const hostConfig = getHostConfig(options.url);
    requestOptions.proxy = hostConfig ? (hostConfig.proxy ? hostConfig.proxy : undefined) : undefined;
    requestOptions.strictSSL = options.strictSSL;
    requestOptions.url = options.url;
    requestOptions.resolveWithFullResponse = options.resolveWithFullResponse;
    requestOptions.headers = getCookieHeader(options, hostConfig);
    return requestOptions;
};

const getHostConfig = (url) => {
    let hostConfig;

    if (!config.hosts)
        return undefined;
        
    config.hosts.forEach((entry) => {
        if (url.indexOf(entry.host) !== -1) {
            hostConfig = entry;
        }
    });

    return hostConfig;
};

const getCookieHeader = (options, hostConfig) => {
    if (!hostConfig || !hostConfig.cookies) {
        return undefined;
    }

    let cookieHeader = "";

    hostConfig.cookies.forEach((cookieKey) => {
        if (options.hasOwnProperty(config.cookiePrefix + cookieKey)) {
            cookieHeader += cookieKey + "=" + options[config.cookiePrefix + cookieKey] + ";";
        }
    })

    return { "cookie": cookieHeader };
};

module.exports = LinkProcessor;