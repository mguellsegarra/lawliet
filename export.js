'use strict';

const Promise = require("bluebird");
const config = require('./config');
const writeFile = Promise.promisify(require("fs").writeFile);
const chalk = require('chalk');
const json2csv = require('json2csv');
const LinkStatus = require('./linkStatus');

const Export = {
    write: (data) => {
        const csvfile = json2csv({ data: transformData(data), fields: [
            "file", "url", "code"
        ]});

        console.log("\n___________________________\n");

        return writeFile(config.outputFilename, csvfile, 'utf8')
            .then(() => {
                console.log(chalk.white("📗 📗 📗  Successfully written possible broken links report to ") + chalk.white.bold.underline(config.outputFilename));
            })
            .catch(() => {
                console.log(chalk.red.bold("❌  Error exporting to file!"));
            });
    }
};

const transformData = (data) => {
    let formattedData = [];

    for (let property in data) {
        if (data.hasOwnProperty(property)) {
            data[property].forEach((item) => {
                if (item.status !== LinkStatus.SUCESSFUL) {
                    formattedData.push(
                        {
                            file: property,
                            url: item.url,
                            code: item.code
                        }
                    );    
                }
            });
        }
    }

    return formattedData;
};

module.exports = Export;