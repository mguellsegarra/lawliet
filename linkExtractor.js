'use strict';

const Promise = require("bluebird");
const recursive = Promise.promisify(require("recursive-readdir"));
const getUrls = require('get-urls');
const readFile = Promise.promisify(require("fs").readFile);
const path = require('path')
const chalk = require('chalk');

const LinkExtractor = {
    start: (options) => {
        return recursive(options.path, [(file, stats) => {
            if (stats.isFile()) {
                return path.extname(file) !== options.extension;
            }
            return false;
        }])
            .then((files) => {
                return getUrlsInFiles(files);
            })
    }
};

const getUrlsInFiles = (files) => {
    let fileUrls = {};
    let totalFiles = 0;
    let totalUrls = 0;

    return Promise.map(files, (currentFile) => {
        return extractUrlsForFile(currentFile).then((foundUrls) => {
            totalFiles += 1;
            fileUrls[currentFile] = foundUrls;
            totalUrls += foundUrls.length;
            return Promise.resolve();
        });
    })
        .then(() => {
            console.log(chalk.bold('✓ ') + chalk.white("Found " + totalFiles + " files, with a total of " + totalUrls + " urls inside"));
            return Promise.resolve({
                fileUrls: fileUrls,
                totalFiles: totalFiles, 
                totalUrls: totalUrls});
        });
};

const extractUrlsForFile = (file) => {
    let fixedUrls = [];

    return readFile(file, "utf8").then((content) => {
        return Promise.resolve(getUrls(content));
    }).then((urls) => {
        return Promise.map(urls, (url) => {
            let fixedUrl = url.replace('):', '');
            fixedUrl = fixedUrl.replace('))', '');
            fixedUrl = fixedUrl.replace('),', '');
            fixedUrl = fixedUrl.replace(')', '');
            fixedUrl = fixedUrl.replace('%27', '');            
            fixedUrl = fixedUrl.replace(',', '');            
            fixedUrl = fixedUrl.replace('**', '');        
            fixedUrl = fixedUrl.replace('*', '');                
            fixedUrls.push(fixedUrl);
        })
        .then(() => {
            return Promise.resolve(fixedUrls);
        })
    });
};

module.exports = LinkExtractor;