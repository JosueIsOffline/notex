const { expect } = require("chai");
const {
  buildDriver,
  By,
  until,
  takeScreenshot,
  clearLocalStorage,
  BASE_URL,
} = require("./helpers/driver");

describe("Historia 1 - Creación de Notas", function () {
  let driver;

  beforeEach(async function () {
    this.timeout(10000);
    driver = await buildDriver(true);
    await driver.get(BASE_URL);
    await clearLocalStorage(driver);
  });

  afterEach(async function () {
    await takeScreenshot(driver, `after-${this.currentTest.title}`);
    await driver.quit();
  });

  it("Camino feliz: crear nota con título y contenido", async function () {
    // Abrir modal
    await driver
      .wait(
        until.elementLocated(
          By.xpath("//button[@id='btnAdd' or contains(text(),'Add note')]"),
        ),
        5000,
      )
      .then((el) => el.click());

    // Esperar modal
    await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(text(),'Crear') or contains(text(),'Nueva')]"),
      ),
      5000,
    );

    // Inputs reales
    const titleInput = await driver.findElement(By.id("noteTitle"));
    const contentInput = await driver.findElement(By.id("noteContent"));

    await titleInput.sendKeys("Prueba Selenium");
    await contentInput.sendKeys("Contenido de la nota automatizada");

    const saveBtn = await driver.findElement(By.id("btnSave"));
    await saveBtn.click();

    // Validar que la nota aparece en pantalla
    const noteTitle = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//p[contains(@class,'font-semibold') and contains(text(),'Prueba Selenium')]",
        ),
      ),
      5000,
    );

    const noteContent = await driver.findElement(
      By.xpath("//p[contains(text(),'Contenido de la nota automatizada')]"),
    );

    expect(await noteTitle.getText()).to.include("Prueba Selenium");
    expect(await noteContent.getText()).to.include(
      "Contenido de la nota automatizada",
    );

    // Validar que se guardó en localStorage
    const raw = await driver.executeScript(
      "return window.localStorage.getItem('notes');",
    );

    expect(raw).to.be.a("string");
    expect(raw).to.include("Prueba Selenium");
  });

  it("Negativa: no permite crear sin título", async function () {
    // Abrir modal
    await driver.findElement(By.id("btnAdd")).click();

    // Completar solo contenido
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Solo contenido sin título");

    await driver.findElement(By.id("btnSave")).click();

    // Modal NO debe cerrarse
    const modalStillOpen = await driver.findElements(
      By.xpath("//h2[contains(text(),'Crear') or contains(text(),'Nueva')]"),
    );

    expect(modalStillOpen.length).to.be.greaterThan(0);
  });

  it("Prueba de límites: no guarda si el usuario escribe solo espacios", async function () {
    // Abrir modal
    await driver.findElement(By.id("btnAdd")).click();

    await driver.findElement(By.id("noteTitle")).sendKeys("   ");
    await driver.findElement(By.id("noteContent")).sendKeys("   ");

    await driver.findElement(By.id("btnSave")).click();

    // Modal debe seguir abierto
    const modalStillOpen = await driver.findElements(
      By.xpath("//h2[contains(text(),'Crear') or contains(text(),'Nueva')]"),
    );

    expect(modalStillOpen.length).to.be.greaterThan(0);
  });
});
