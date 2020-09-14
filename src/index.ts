import puppeteer from 'puppeteer'
import { env } from './env'
import { selectors } from './selectors'

//Navigation

async function navigation() {
	//Init browser
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()

	//Goto url specified in env file
	await page.goto(env.url)
	await page.waitFor(selectors.email)

	//Input login and Password of user
	await page.type(selectors.email, env.username)
	await page.type(selectors.password, env.password)

	//Clicl submit button and wait for page to load
	await page.click(selectors.submit)
	await page.waitForNavigation({ waitUntil: 'load' })

	//Redirect to DM's
	await page.goto(env.userurl)
	await page.waitForSelector(selectors.messages)

	return page
}

//Count total gifs in messages
async function countGifs(page: puppeteer.Page){
	//Loop through message list and query to the a tag with link
	const messages = await page.$$eval(selectors.messages, (elements) => {
		return elements.map((el) => {
			return el.querySelector('div[class^="container-"]')?.querySelector('div a')?.getAttribute('href')
		})
	})

	//Log Total messages
	console.log('%cLENGHT = ' + messages.length, 'background: #222; color: #bada55')

	let gifcount = 0;

	//Count gif's
	for(let i = 0; i < messages.length; i++)
		if(messages[i] != undefined)
			gifcount++;

	//return it
	return gifcount
} 

async function main() {
	const page = await navigation()
	console.log("total gifs: " + await countGifs(page))
}

main()
