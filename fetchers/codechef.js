const logger = require('../logger');
const jsdom = require('jsdom')
const moment = require('moment-timezone');

module.exports = {
	name: "codechef",
	updateUpcoming: (fetchers_list_update_cb) => {
		let upcoming = [];

		jsdom.env("https://www.codechef.com/contests",
			["http://code.jquery.com/jquery.js"],
			(err, window) => {
				if (err) {
					logger.error("Failed on CodeChef.", err);
					return;
				}
				const $ = window.$
				const list = $("table.dataTable:eq(0),table.dataTable:eq(1)").children('tbody').children()
				upcoming.length = 0;
				list.find('a').each((i, x) => {
					if ((/Challenge|Cook|Lunchtime/i.test(x.text) && /January|February|March|April|May|June|July|August|September|October|November|December/i.test(x.text)) || /Snackdown/i.test(x.text)) {
						const contest = list.eq(i).children(); // contest to be added
						const _start = moment.tz(contest.filter('.start_date').text(), 'DD MMM YYYY HH:mm:ss', 'Asia/Colombo');
						const _end = moment.tz(contest.filter('.end_date').text(), 'DD MMM YYYY HH:mm:ss', 'Asia/Colombo');
						if (!_start.isValid() || !_end.isValid()) {
							logger.error('Codechef invalid dates for ' + x.text);
							logger.error("\t Start: " + _start);
							logger.error("\t End: " + _end);
							return;
						}
						const start = _start.toDate();
						const end = _end.toDate();
						if (end.getTime() < Date.now()) return;
						upcoming.push({
							judge: 'codechef',
							name: x.text,
							url: x.href,
							time: start,
							duration: (end.getTime() - start.getTime()) / 1000
						});
					}
				});

				fetchers_list_update_cb(upcoming);
			});
	}
}
