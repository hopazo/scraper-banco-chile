const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { user } = require('./config');

const USER_INPUT_SELECTOR = '#iduserName';
const PASS_INPUT_SELECTOR = 'input.form-control:nth-child(2)';
const LOGIN_BUTTON_SELECTOR = '#idIngresar';

const BANK_URL = 'https://bancochile.cl';
const HOME_LOGIN_BUTTON_SELECTOR = '#btn_bch_menu_banco-en-linea';

const ACCOUNT_LINK = 'a[ng-click^="widget.navegarProducto"]';
const TABLE_SELECTORS = {
  TRANSACTIONS_ROW_SELECTOR: 'tr.bch-row:not(.table-collapse-row)',
  DATE_CELL_SELECTOR: '.bch-column-fechaContable',
  DESCRIPTION_CELL_SELECTOR: '.bch-column-descripcion',
  CHANNEL_CELL_SELECTOR: '.bch-column-canal',
  OUTFLOW_CELL_SELECTOR: '.bch-column-cargo',
  INFLOW_CELL_SELECTOR: '.bch-column-abono',
  BALANCE_CELL_SELECTOR: '.bch-column-saldo',
}

const PUPPETEER_OPTS = {
    headless: false,
    devtools: false,
}

puppeteer.use(StealthPlugin())

const login = async () => {
	try {
		const browser = await puppeteer.launch(PUPPETEER_OPTS);
		const page = await browser.newPage();
		await page.goto(BANK_URL);
    await page.click(HOME_LOGIN_BUTTON_SELECTOR);
    await page.waitForNavigation();
    const username = await page.$(USER_INPUT_SELECTOR);
    await page.hover(USER_INPUT_SELECTOR);
    await page.click(USER_INPUT_SELECTOR);
    await username.type(user.username, {delay: 94});
    const password = await page.$(PASS_INPUT_SELECTOR);
    await page.keyboard.press('Tab');
    await page.click(PASS_INPUT_SELECTOR);
    await password.type(user.password, {delay: 86});
    await page.keyboard.press('Enter');
    await page.waitForSelector(ACCOUNT_LINK);
    let idn = await page.evaluate((account_link_selector) => {
      account = document.querySelector(account_link_selector);
      account.click();
    }, ACCOUNT_LINK);
    await page.waitForSelector(TABLE_SELECTORS.TRANSACTIONS_ROW_SELECTOR)
    let transactions = await page.evaluate((table_selectors) => {
      let table = document.querySelectorAll(table_selectors.TRANSACTIONS_ROW_SELECTOR);
      rows = Array.from(table);
      let transactions_info = rows.map(row => {
        let date = row.querySelector(table_selectors.DATE_CELL_SELECTOR).textContent.trim();
        let description = row.querySelector(table_selectors.DESCRIPTION_CELL_SELECTOR).textContent.trim();
        let channel = row.querySelector(table_selectors.CHANNEL_CELL_SELECTOR).textContent.trim();
        let outflow = row.querySelector(table_selectors.OUTFLOW_CELL_SELECTOR).textContent.trim();
        let inflow = row.querySelector(table_selectors.INFLOW_CELL_SELECTOR).textContent.trim();
        let balance = row.querySelector(table_selectors.BALANCE_CELL_SELECTOR).textContent.trim();
        return { date, description, channel, outflow, inflow, balance };
      });
      return transactions_info;
    }, TABLE_SELECTORS);
    console.log(JSON.stringify(transactions));
    await page.close;
    await puppeteer.close;
	} catch(error) {
		console.error(error)
	}
}

login();
