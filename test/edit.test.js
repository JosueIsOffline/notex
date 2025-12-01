const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 3 - Edición de Notas", function () {
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

  it("Editar nota existente", async function () {
    // Crear nota inicial
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Original");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido original");
    await driver.findElement(By.id("btnSave")).click();

    // Editar la nota
    let noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Original')]]",
      ),
    );
    const editBtn = await noteDiv.findElement(
      By.xpath(".//button[text()='E']"),
    );
    await editBtn.click();

    await driver.findElement(By.id("noteTitle")).clear();
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Editada");
    await driver.findElement(By.id("noteContent")).clear();
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido editado");
    await driver.findElement(By.id("btnSave")).click();

    // Volver a buscar la nota después de guardar
    noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Editada')]]",
      ),
    );
    const updatedTitle = await noteDiv.findElement(By.tagName("p")).getText();
    expect(updatedTitle).to.include("Nota Editada");
  });
});
