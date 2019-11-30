const logger = require('../logger');
const { JSDOM } = require('jsdom');
const jQuery = require('jquery');
const moment = require('moment-timezone');

module.exports = {
    name: "RPC",
    updateUpcoming: (fetchers_list_update_cb) => {
        let upcoming = [];
        let error = undefined;

        JSDOM.fromURL('http://registro.redprogramacioncompetitiva.com/contests').then(dom => {
            const $ = new jQuery(dom.window);
            const list = $("table:eq(0)").children('tbody').children('tr');
            let ok = false;

            list.each(function() {

                const row = $(this).children('td');
                const name = row.eq(0).text();
                const time = row.eq(1).find('time').attr("datetime");

                contest = {
                    judge: 'RPC',
                    name: name,
                    url: "http://registro.redprogramacioncompetitiva.com/contests",
                    time: moment.tz(time, 'YYYY-MM-DDTHH:mm:ssZ', 'UTC').toDate(),
                    duration: 5*3600
                }

                upcoming.push(contest);

            });

        }).catch(err => {
            error = err;
        }).finally(() => {
            fetchers_list_update_cb(upcoming, error);
        });
    }
}

