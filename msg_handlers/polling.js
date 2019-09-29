/*
 *  DEBUG POLLING ERRORS
 */
const Bot = require('../bot');
const logger = require('../logger');
const utils = require('../utils');
const polling_dbg = module.exports = {};

polling_dbg.maxRecovery = 3;

polling_dbg.maxErrors = 3;

polling_dbg.recoverCount = 0;

polling_dbg.errorCounter = 0;

polling_dbg.rstTimeout = 10000; //reset timeout

polling_dbg.pollingMonitor = function() {
    logger.info('is Polling:',
        Bot.bot.isPolling(),
        `(${polling_dbg.errorCounter}/${polling_dbg.maxErrors})`,
    );
    if (Bot.bot.isPolling() === false) {
        polling_dbg.restart();
    }
};

polling_dbg.restart = function() {
    logger.info('Polling restart trigged!');

    Bot.bot.sendMessage(utils.admin_id,
        "<code>Polling restart trigged!</code>",
        {parse_mode: 'html'}
    );

    setTimeout(() => {
        polling_dbg.recoverCount += 1;

        logger.info('RESTARTING POLLING');

        if(polling_dbg.recoverCount >= polling_dbg.maxRecovery) {
            polling_dbg.recoverCount = 0;

            Bot.bot.sendMessage(utils.admin_id,
                "<code>Polling MAX Recovery!</code>",
                {parse_mode: 'html'}
            );

            setTimeout(() => {
                Bot.bot.startPolling({restart:false});
            }, polling_dbg.rstTimeout*3);

        } else {
            Bot.bot.startPolling({restart:false});
        }

    }, polling_dbg.rstTimeout);
};

polling_dbg.init = function() {

    Bot.bot.on('polling_error', (error) => {
        logger.info(error.code);

        polling_dbg.errorCounter += 1;

        if (polling_dbg.errorCounter >= polling_dbg.maxErrors) {
            //--- something wrong with telegram servers
            logger.info('\n\nMAX POLLING ERRORS REACHED!!!!\n\n');

            polling_dbg.errorCounter = 0;

            Bot.bot.stopPolling({cancel:true, reason:'MAX Polling Erros Reached'});

            //--- restart polling in timeout
            polling_dbg.restart();
        }
    });
};
