import puppeteer from 'puppeteer'
import { env, selectors } from './env'
;(async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()

	await page.goto(env.url)
	await page.waitFor(selectors.email)

	await page.type(selectors.email, env.username)
	await page.type(selectors.password, env.password)

	await page.click(selectors.submit)
	await page.waitForNavigation({ waitUntil: 'networkidle0' })

	await page.goto(env.userurl)
})()
