// NodeJS
// Global configuration file

function loadAPIs() {
    let start = process.hrtime();
    /* ----- Load your APIs here ----- */
    // global.apiname = require('module');

    /* ----- Do not modify code below, for risk of breaking stuff ----- */
    let end = process.hrtime(start);
    try {
        log.success(`APIs loaded in ${end[1] / 1000000}ms`);
    } catch (e) {
        console.log(`APIs loaded in ${end[1] / 1000000}ms`);
    }
}

function beginSetUp(testing, logger, embedder) {
    // Require path and fs as globals, they'll be used regularly
    global.path = require('path');
    global.fs = require('fs');

    // Check if we are using the logger
    if (logger) setUpLogger();
    else {
        console.log("Please consider using the logger, if you are hosting the bot!");
    }

    // Continue the set up
    continueSetUp(testing, embedder);
}

function setUpLogger() {
    let start = process.hrtime();
    global.log = require(path.join(__dirname, '.', 'Modules', 'logger.js'));
    let end = process.hrtime(start);
    try {
        log.success(`Logger initialized successfully in ${end[1] / 1000000}ms`);
    } catch (e) {
        console.log("Error setting up the logger, please see error logs.");
        fs.mkdirSync(path.join(__dirname, '..', 'Logs'));
        fs.writeFileSync(`Logger attempted to load for ${end[1] / 1000000}ms. Stack trace:\n${e}`, path.join(__dirname, '..', 'Logs', `${new Date()}.log`));
    }
}

function continueSetUp(testing, embedder) {
    // Load discord.js
    global.Discord = require('discord.js');

    // Check for (and possibly load) the embedder
    if (embedder) {
        let start = process.hrtime();
        try {
            global.embedder = require(path.join(__dirname, '.', 'Modules', 'embedder.js'));
        } catch (e) {
            // Apparently they modified the embedder >:C
            // Guess we'll be nice and toss an error in a clean way.
            try {
                // Attempt logger first
                log.error(`Embedder loading failed!`, e);
            } catch (e2) {
                console.log(`Embedder loading failed! Stack trace:\n${e}`);
            }
        }
        let end = process.hrtime(start);
        try {
            log.success(`Embedder loading complete in ${end[1] / 1000000}ms`);
        } catch (e) {
            console.log(`Embedder loading complete in ${end[1] / 1000000}ms`);
        }
    }

    // Load configs if not testing
    if (!testing) {
        let start = process.hrtime();
        try {
            global.configs = JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, '.', 'Configuration', 'configuration.json')
                )
            );
        } catch (e) {
            // Configs didn't exist, scream to use the config generator.
            try {
                log.error(`Configuration file doesn't exist or has been modified to an invalid format! Please run the config generator file to generate a clean config file.`, e);
            } catch (e2) {
                console.log(`Configuration file is incorrectly formatted or doesn't exist. Please run the configuration generator to create a fresh config file.`);
            }
        }
        let end = process.hrtime(start);
        try {
            log.success(`Configs loaded in ${end[1] / 1000000}ms`);
        } catch (e) {
            console.log(`Configs loaded in ${end[1] / 1000000}ms`);
        }
    } else {
        try {
            log.warning(`Config loading skipped due to testing switch!`);
        } catch (e) {
            console.log(`Config loading skipped due to testing switch!`);
        }
    }

    // Put your own APIs to load in this function
    loadAPIs();

    // Create the client and load commands
    global.client = new Discord.Client();

    client.commands = new Discord.Collection();
    let start = process.hrtime();
    let commandFiles = fs.readdirSync(path.join(__dirname, '.', 'Commands')).filter(file => file.endsWith('.js'));
    let i = 0;
    for (let file of commandFiles) {
        try {
            let command = require(path.join(__dirname, 'Commands', file));
            ++i;
            client.commands.set(command.name, command);
        }
        catch (e) {
            try {
                log.warning(`Command unable to be loaded! File: ${file}\nStack trace:\n ${e}`);
            } catch (e2) {
                console.log(`Unable to load command. Stack trace:\n${e}`);
            }
        }
    }
    let end = process.hrtime(start);
    try {
        log.success(`${i} command(s) loaded in ${end[1] / 1000000}ms`);
    } catch (e) {
        console.log(`${i} command(s) loaded in ${end[1] / 1000000}ms`);
    }

    // Load command handler
    start = process.hrtime();
    try {
        global.handler = require(path.join(__dirname, '.', 'Modules', 'handler.js'));
    } catch (e) {
        // Apparently they modified the command handler >:C
        // Oh well, toss a nice error.
        try {
            log.error(`Command handler unable to be loaded!`, e);
        } catch (e2) {
            console.log(`Command handler unable to be loaded! Stack trace:\n${e}`);
        }
    }
    end = process.hrtime(start);
    try {
        log.success(`Command handler loaded in ${end[1] / 1000000}ms`);
    } catch (e) {
        console.log(`Command handler loaded in ${end[1] / 1000000}ms`);
    }

    // Run the unit tester, if needed.
    if (testing) require(path.join(__dirname, 'UnitTests', 'unit_test_main.js'));

    // Start the bot
    require(path.join(__dirname, '.', 'main.js'));
}

module.exports.beginSetUp = beginSetUp;