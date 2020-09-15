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

//Get Latest messages
async function latestMessages(page: puppeteer.Page) {
	//Loop through message list and query to the a tag with link
	const messages = await page.$$eval(selectors.messages, (elements) => {
		return elements.map((el) => {
			return el.querySelector('div[class^="container-"] div a')?.getAttribute('href')!
		})
	})
	//Log Total messages
	// console.log('%c[INFO]Total Messages = ' + messages.length, 'background: #222; color: #bada55')
	return messages
}


//Get users corresponding to messages
async function userToMessage(page: puppeteer.Page) {
	//Loop through message list and query the users
	const users = await page.$$eval(selectors.messages, (elements) => {
		return elements.map((el) => {
			return el.querySelector('span[class^="username-"]')?.innerHTML
	})
})
	return users
}

function interpretUsers(users: (string | undefined)[]) {
	for(let i = 0; i < users.length; i++)
		if(users[i] == undefined)	
			users[i] = users[i - 1]
	return users
}

async function responseLoop(users : (string | undefined)[], messages : string[], callback : Function, page: puppeteer.Page){
	//Gif Counter
	let gifs = 0
	for(let i = users.length - 1; i > users.length - env.fillGifs - 1; i--){
		//Count as gif if target Nickname sent a gif
		console.log("i: " + i + "	" + users[i] + " 	" + messages[i])
		if(users[i] == env.nickname && messages[i])
			gifs++
		//Do action if gifCount surpasses max amount
		if(gifs >= env.maxGifs){
			await callback(page)
			break;
		}
	}
}

//Reply with gifs to fill the chat
async function Reply(page: puppeteer.Page){
	//Reply code
	for(let i = 0; i < env.fillGifs; i++){
		await page.type(selectors.form, env.response)
		await page.keyboard.press('Enter')
	}
}

//Main
async function main() {
	//Get Dms page
	const page = await navigation()
	
	//Event loop
	while(true){
		//Get all Latest messages
		const messages = await latestMessages(page)
		//Get all user to message relations
		const users = interpretUsers( await userToMessage(page) )

		await page.waitFor(3000)
		await responseLoop(users,messages, Reply, page)
	}
}

main()
