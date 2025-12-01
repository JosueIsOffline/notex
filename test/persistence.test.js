const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 6 - Persistencia de Notas", function () {
  let driver;

  beforeEach(async function () {
    driver = await buildDriver(true);
    await driver.get(BASE_URL);
    await clearLocalStorage(driver);
  });

  afterEach(async function () {
    await takeScreenshot(driver, `after-${this.currentTest.title}`);
    await driver.quit();
  });

  it("Notas persisten en localStorage al recargar", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Persistente");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido Persistente");
    await driver.findElement(By.id("btnSave")).click();

    await driver.navigate().refresh();

    const noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Persistente')]]",
      ),
    );
    const titleText = await noteDiv.findElement(By.tagName("p")).getText();
    expect(titleText).to.include("Nota Persistente");

    const raw = await driver.executeScript(
      "return window.localStorage.getItem('notes');",
    );
    expect(raw).to.be.a("string");
    expect(raw).to.include("Nota Persistente");
  });
});
