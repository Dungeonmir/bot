const http = require('http');
const https = require('https');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const {
  start
} = require('repl');
const { parseNumbers } = require('xml2js/lib/processors');

const token = 'token';
const bot = new TelegramBot(token, {
  polling: true
});
//const botName = 'CurrencyOffbot';



const hostname = '127.0.0.1';
const port = 3000;

bot.on("polling_error", console.log);
bot.on('message', (msg) => {
  console.log('\nMessage: ' + msg.text);
  console.log('Message ID: ' + msg.message_id);
  console.log('Username: ' + msg.chat.username);
  console.log('Chat ID: ' + msg.chat.id);
  console.log('Timestamp' + msg.date);
  const chatId = msg.chat.id;
  const text = msg.text;
  // send a message to the chat acknowledging receipt of their message
  switch (text) {
    case '/start':
      sendMsg(`Hello, ${msg.chat.username}`)
      break;
    case '/options':
      sendMsg('\nSend bot name of currency you are interested in.\n To get value of usd in some currency, type: \n[number] [currency]\n');
      break;
    case '/all':
      sendCurrency();
      break;
    case '/top':
      sendTopCurrencies();
      break;
    case '/change_currency':
      //change currency 
      changeCurrency(text);
      break;
    default:
      sendCurrency(text);
      break;
  }

  function sendMsg(text) {
    bot.sendMessage(chatId, text);
  }

  function sendCurrency(text) {

    var rawdata = fs.readFileSync('static/data/currency.json', 'utf8');
    let currencies = JSON.parse(rawdata);
    rawdata = fs.readFileSync('static/data/currencies.json', 'utf8');
    let decryption = JSON.parse(rawdata);
    let msg = 'undefined';
    if (text) {
      let pattern = /^[0-9]*/;
      let number ='';
      if (text.match(pattern)[0]!='') {
        number = parseNumbers(text.match(pattern)[0]);
      }
      
      let currency = text.match(/[a-z]*$/);
      for (let i in currencies['usd']) {
        if (currency == i) {
          let value = currencies['usd'][i];
          let decryptionValue = decryption[i];
          let newValue = '';
          if (number!='') {
            newValue = number * value;
            number +='$ * ';
          }
          
          msg = decryptionValue + '\n' + number  + value + ' = ' + newValue + currency;
        }
      }

    } else {
      msg = '';
      for (let i in currencies['usd']) {
        let currency = i;
        let value = currencies['usd'][i];
        msg += currency + ' ' + value + '\n';
      }

    }

    sendMsg(msg);
  }

  function sendTopCurrencies() {
    sendMsg('Top currencies:\n1. ');
    //Из базы данных достаем любимую валюту
  }
  function changeCurrency(text){
    sendMsg('Changing currency ');
  }
});

const server = http.createServer((req, res) => {

  switch (req.url) {
    case '/':
      sendRes('html/index.html', 'text/html', res);

      break;
    case '/bot/':
      sendRes('html/bot.html', 'text/html', res);

      break;
    case '/bot/getCurrencies/':
      break;
    case '/bot/update':
      createFileFromUrl('currency.json', 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd.json');
      createFileFromUrl('currencies.json', 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json');
      console.log('Exchange rates updated');

      break;
    default:
      sendRes(req.url, getContentType(req.url), res);
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function sendRes(url, contentType, res) {
  let file = path.join(__dirname + '/static/', url);
  fs.readFile(file, (err, content) => {
    if (err) {
      console.log(`Error with ${file}`);
      console.log(err);
      res.writeHead(404);
      res.write('Cannot find file');
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Type': contentType
      });
      res.write(content);
      res.end();
      console.log(`200, ${file}`);
    }
  });
}

function getContentType(url) {
  switch (path.extname(url)) {
    case 'html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case 'js':
      return 'text/javasrcipt';
    case '.json':
      return 'application/json';
    default:
      return 'application/octate-stream';
  }
}

function createFileFromUrl(fileName, url) {
  const file = fs.createWriteStream('static/data/' + fileName);
  const request = https.get(url, function (response) {
    response.setEncoding('utf8');
    response.pipe(file);

  });
}