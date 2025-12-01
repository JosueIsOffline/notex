const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 5 - Cancelar y cerrar dialogo", function () {
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

  it("Cancelar creación de nota no agrega nada", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Cancelada");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido Cancelado");
    await driver.findElement(By.id("btnCancel")).click();

    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Cancelada')]]",
      ),
    );
    expect(notes.length).to.equal(0);
  });

  it("Cerrar dialogo con X no agrega nada", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Cerrada");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido Cerrado");
    await driver.findElement(By.id("btnClose")).click();

    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Cerrada')]]",
      ),
    );
    expect(notes.length).to.equal(0);
  });
});
