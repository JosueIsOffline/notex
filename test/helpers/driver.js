const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "..", "..", "screenshots");
if (!fs.existsSync(SCREENSHOT_DIR))
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = process.env.NOTEX_URL || "http://127.0.0.1:5500";

async function buildDriver(headless = true) {
  const chrome = require("selenium-webdriver/chrome");
  const options = new chrome.Options();
  if (headless && process.env.MOCHA_HEADLESS !== "false") {
    options.addArguments("--headless=new");
    options.addArguments("--disable-gpu");
  }
  options.addArguments("--window-size=1280,800");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  driver
    .manage()
    .setTimeouts({ implicit: 2000, pageLoad: 10000, script: 5000 });
  return driver;
}

let counter = 0;
async function takeScreenshot(driver, testName) {
  const safeName = testName.replace(/[^a-z0-9_\-]/gi, "_"); // reemplaza todo lo que no sea letras, números, _ o -
  const dir = path.resolve(__dirname, "../../screenshots");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `${safeName}.png`);
  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, "base64");
}

async function clearLocalStorage(driver) {
  await driver.executeScript("window.localStorage.clear();");
}

module.exports = {
  Builder,
  By,
  until,
  buildDriver,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
};
