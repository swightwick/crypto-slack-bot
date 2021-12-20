require('dotenv').config()

const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/web-api');
// Set Slack Token and Channel ID
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const conversationId = process.env.CHANNEL_ID;
(async () => {
  try {
		// Scraper
		const browser = await puppeteer.launch({
			'args' : [
				'--no-sandbox',
				'--disable-setuid-sandbox'
			]
		});
		const page = await browser.newPage()
		await page.goto('https://coinmarketcap.com/currencies/electroneum/')

    const price = await page.$eval('.priceSection .priceValue span', el => el.innerText)
		const priceChangePercent = await page.$eval('.priceSection .priceTitle .feeyND', el => el.innerText)
    const rank = await page.$eval('.nameSection .namePillPrimary', el => el.innerText)
		const twentyFourVolume = await page.$eval('.statsBlock:nth-of-type(3) .statsValue', el => el.innerText)
		const supply = await page.$eval('.n78udj-6.dCjIMS .statsValue', el => el.innerText)
		console.log(
			'PRICE ' + price, 
			'CHANGE ' + priceChangePercent, 
			'RANK' + rank, 
			'24hr VOLUME ' + twentyFourVolume, 
			'SUPPLY ' + supply
		)
		await browser.close()

		// Webhook
		const res = await web.chat.postMessage(
		{ 
			channel: conversationId, 
			blocks: [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": ":zap: *Electroneum Price Update Bot*  :zap:\nCurrent Rank : *" + rank + '*',
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"fields": [
						{
							"type": "mrkdwn",
							"text": ':moneybag: ETN Price\n*' + price + '*'
						},
						{
							"type": "mrkdwn",
							"text": ':rocket: Price change\n*' + '*' + priceChangePercent + '*'
						}
					]
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"fields": [
						{
							"type": "mrkdwn",
							"text": ':hourglass: 24hr Volume\n*' + twentyFourVolume + '*'
						},
						{
							"type": "mrkdwn",
							"text": ':hourglass_flowing_sand: Circulating Supply \n*' + supply + '*'
						}
					]
				},
				{
					"type": "divider"
				},
				{
					"type": "context",
					"elements": [
						{
							"type": "mrkdwn",
							"text": "Source <https://coinmarketcap.com/currencies/electroneum/>"
						}
					]
				},
				{
					"type": "context",
					"elements": [
						{
							"type": "mrkdwn",
							"text": "made by github.com/swightwick"
						}
					]
				}]
		});
    console.log('Message sent: ', res.ts);
  } catch(e) {
    console.log('Error from console', e)
  }
})()
