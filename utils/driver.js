const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const config = require("../config/config");

class DriverFactory {
  static async createDriver() {
    const options = new chrome.Options();

    options.addArguments("--start-maximized");
    options.addArguments("--disable-blink-features=AutomationControlled");
    options.addArguments("--disable-extensions");

    // Descomentar para modo headless (sin interfaz gráfica)
    // options.addArguments('--headless');
    // options.addArguments('--disable-gpu');

    const driver = await new Builder()
      .forBrowser(config.browser)
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: config.timeout,
      pageLoad: 30000,
      script: 30000,
    });

    return driver;
  }

  static async quitDriver(driver) {
    if (driver) {
      await driver.quit();
    }
  }
}

module.exports = DriverFactory;
