const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 4 - Eliminación de Notas", function () {
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

  it("Eliminar nota existente", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota a eliminar");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido a eliminar");
    await driver.findElement(By.id("btnSave")).click();

    const noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota a eliminar')]]",
      ),
    );
    const delBtn = await noteDiv.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota a eliminar')]]",
      ),
    );
    expect(notes.length).to.equal(0);
  });
});
