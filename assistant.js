'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('./config');
const Box = require("cli-box");

const Assistant = {
    start: () => {

        var b1 = Box("70x3", chalk.gray("Death notes for broken links in your documentation files"));
        console.log("\n                          📓  " + chalk.bold.underline("Lawliet") + " 📓\n" + b1.toString() + "\n");

        var questions = [
            {
                type: 'input',
                name: 'path',
                message: 'Enter path for recursive search - default:',
                default: __dirname
            },
            {
                type: 'input',
                name: 'extension',
                message: 'Regex extension pattern for files to search in - default:',
                default: config.extensionFiles
            }
        ];
    
        config.hosts.forEach(hostConfig => {
            hostConfig.cookies.map((cookieKey) => {
                const cookiePrompt = {
                    type: 'input',
                    name: config.cookiePrefix + cookieKey,
                    message: 'Enter value for cookie named ' + cookieKey + ':',
                    default: ""
                };
        
                questions.push(cookiePrompt);
            })    
        });

    
        return inquirer.prompt(questions);
    }
}

module.exports = Assistant;