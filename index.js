'use strict';

const Assistant = require('./assistant');
const LinkExtractor = require('./linkExtractor');
const LinkProcessor = require('./linkProcessor');
const Export = require('./Export');

const chalk = require('chalk');

Assistant.start().then((options) => {
  console.log("\n___________________________\n");
  console.log(chalk.white.bold('→ ') + chalk.white("Searching for " + options.extension + " files in " + options.path + " ..."));
  LinkExtractor.start(options)
    .then((result) => {
      Object.assign(options, {
        totalFiles: result.totalFiles,
        totalUrls: result.totalUrls
      });
      return LinkProcessor.start(result.fileUrls, options);
    })
    .then((result) => {
      return Export.write(result);
    })
    .catch(console.log);
});