const Bot = require('node-telegram-bot');
const dateformat = require('dateformat');

const formatMessage = (upcoming) => {
  var result = "";

  upcoming.forEach( (entry) => {
    result += 
      dateformat(entry.time, "HH:MM dd mmm yyyy") + " | " + 
      "[" + entry.name + "](" + entry.url + ")" + 
      "  \n";
  });

  return result;
}

module.exports = (upcoming) => {
  const bot = new Bot({token: '378707423:AAE_keAPD3pjfJgiyBpp678iZP4dXdcBLRM'});

  bot.on('message', function (message) {
    if (message.text == '/upcoming') {
      bot.sendMessage({
        chat_id: message.from.id,
        text: formatMessage(upcoming),
        parse_mode: 'Markdown'
      });
    }
  });

  bot.start();
}