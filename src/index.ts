import puppeteer from 'puppeteer'
import { env, selectors } from './env'
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
	await page.waitForNavigation({ waitUntil: 'networkidle0' })

	//Redirect to DM's
	await page.goto(env.userurl)
}

navigation()
