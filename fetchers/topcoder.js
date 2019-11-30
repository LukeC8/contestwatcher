const logger = require('../logger');
const ical = require('ical');

module.exports = {
	name: "topcoder",
	updateUpcoming: (fetchers_list_update_cb) => {

		ical.fromURL(
			'https://calendar.google.com/calendar/ical/appirio.com_bhga3musitat85mhdrng9035jg%40group.calendar.google.com/public/basic.ics', 
			{},
			(err, data) => {
				let upcoming = [];

				for (var key in data) {
					if (!data.hasOwnProperty(key))
						continue;
					var el = data[key];

					if (/(SRM|TCO)/g.test(el.summary)) {
						var entry = {
							judge: 'topcoder',
							name: el.summary,
							url: 'http://topcoder.com/',
							time: new Date(el.start),
							duration: (el.end - el.start) / 1000
						};

						var ending = new Date(entry.time);
						ending.setSeconds(ending.getSeconds() + entry.duration);
						if (ending.getTime() >= Date.now())
							upcoming.push(entry);
					}
				}

				upcoming.sort( (a, b) => { return a.time - b.time; });

				fetchers_list_update_cb(upcoming);
			}
		);
	}
};
