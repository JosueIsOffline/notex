const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 2 - Visualización de Notas", function () {
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

  it("Muestra notas en el grid y botones E/D", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota 1");
    await driver.findElement(By.id("noteContent")).sendKeys("Contenido 1");
    await driver.findElement(By.id("btnSave")).click();

    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota 2");
    await driver.findElement(By.id("noteContent")).sendKeys("Contenido 2");
    await driver.findElement(By.id("btnSave")).click();

    await driver.wait(
      until.elementsLocated(
        By.xpath("//section[@id='notesContainer']/div[.//p]"),
      ),
      5000,
    );

    const notes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    expect(notes.length).to.be.at.least(2);

    const firstNote = notes[0];
    const editBtns = await firstNote.findElements(
      By.xpath(".//button[text()='E']"),
    );
    const delBtns = await firstNote.findElements(
      By.xpath(".//button[text()='D']"),
    );

    expect(editBtns.length).to.be.greaterThan(0);
    expect(delBtns.length).to.be.greaterThan(0);
  });

  it("Si no hay notas sólo aparece Add note +", async function () {
    // Limpiar localStorage y recargar
    await driver.executeScript("window.localStorage.clear();");
    await driver.navigate().refresh();

    // Esperar que el botón Add note aparezca
    const add = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//button[contains(.,'Add note') or contains(.,'Add note +') or contains(.,'Agregar nota')]",
        ),
      ),
      5000,
    );

    // Contar solo notas con contenido
    const notes = await driver.findElements(
      By.xpath(
        "//div[contains(@class,'note') or contains(@class,'card')][.//p or .//strong]",
      ),
    );

    expect(notes.length).to.equal(0);
    expect(add).to.not.be.null; // El botón existe
  });
});
