const logger = require('../logger');
const ical = require('ical');

module.exports = {
	name: "calendar",
	updateUpcoming: (fetchers_list_update_cb) => {
		let upcoming = [];

		ical.fromURL(
			'https://calendar.google.com/calendar/ical/t313lnucdcm49hus40p3bjhq44%40group.calendar.google.com/public/basic.ics',
			{},
			(err, data) => {
				upcoming.length = 0;

				for (var key in data) {
					if (!data.hasOwnProperty(key))
						continue;
					var el = data[key];

					var entry = {
						judge: 'calendar',
						name: el.summary,
						url: 'https://calendar.google.com/calendar/embed?src=t313lnucdcm49hus40p3bjhq44%40group.calendar.google.com&ctz=America/Sao_Paulo',
						time: new Date(el.start),
						duration: (el.end - el.start) / 1000
					};

					var url;
					if (typeof el.description !== 'undefined')
						url = el.description.split(/\s/g)[0];
					if (typeof url !== 'undefined' && /^http/.test(url))
						entry.url = url;

					var ending = new Date(entry.time);
					ending.setSeconds(ending.getSeconds() + entry.duration);
					if (ending.getTime() >= Date.now())
						upcoming.push(entry);
				}

				upcoming.sort( (a, b) => { return a.time - b.time; });

				fetchers_list_update_cb(upcoming);
			}
		);
	}
};
