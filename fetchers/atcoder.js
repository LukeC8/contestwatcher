const logger = require('../logger');
const { JSDOM } = require('jsdom');
const jQuery = require('jquery');
const moment = require('moment-timezone');

function isNumeric(string) {
    return !isNaN(string);
}

/* Validate a duration array
Expected format ['HH', 'mm'];
*/
function valid(duration){
    return duration.length == 2
        && isNumeric(duration[0])
        && isNumeric(duration[1])
        && parseInt(duration[1]) < 60;
}

module.exports = {
    name: "atcoder",
    updateUpcoming: (fetchers_list_update_cb) => {
        let upcoming = [];
        let error = undefined;

        JSDOM.fromURL("https://atcoder.jp/contests/").then(dom => {
            const $ = new jQuery(dom.window);

            /* There's no specific classes or ids for the tables.
               We gather information of the table 3 if there is no active contests, otherwise
               we gather information fo the table 2.
             */

            //check if there is the active contests table
            const isActiveContest = $("table").length == 4;
            const tableToCheck = 1 + isActiveContest;

            var contests = $(`table:eq(${tableToCheck})`).children('tbody').children('tr');

            contests.each(function (){
                const row = $(this).children('td');
                const name = row.eq(1).find('a').text();

                /* There's always this practice contest -- deprecated*/
                if(name == 'practice contest') return;

                const start = moment.tz(row.eq(0).find('time').text(), 'YYYY-MM-DD HH:mm:ss', 'Asia/Tokyo');
                const duration = row.eq(2).text().split(':'); /* HH:mm */
                const url = row.eq(1).find('a').attr('href');

                if(!start.isValid() || !valid(duration)) {
                    logger.error("AtCoder invalid dates for " + name);
                    logger.error("\t Start: " + start);
                    logger.error("\t Duration: " + duration);
                    return;
                }

                upcoming.push({
                    judge: 'atcoder',
                    name: name,
                    url: 'https://atcoder.jp' + url,
                    time: start.toDate(),
                    duration: duration[0] * 3600 + duration[1] * 60
                });
            });

        }).catch(err => {
            error = err;
        }).finally(() => {
            fetchers_list_update_cb(upcoming, error);
        });
    }
}
