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

  it("Camino feliz: Muestra notas en el grid y botones E/D", async function () {
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

  it("Camino feliz: Carga notas desde localStorage al iniciar", async function () {
    // Crear una nota
    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Persistente");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido Persistente");
    await driver.findElement(By.id("btnSave")).click();

    // Recargar página
    await driver.navigate().refresh();

    // Verificar que la nota sigue ahí
    const noteDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Persistente')]]",
        ),
      ),
      5000,
    );

    const titleText = await noteDiv
      .findElement(By.xpath(".//p[@class='font-semibold text-lg mb-3']"))
      .getText();
    expect(titleText).to.include("Nota Persistente");
  });

  it("Negativa: Si no hay notas sólo aparece Add note +", async function () {
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

    // Contar solo notas con contenido real (excluyendo el botón Add note)
    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[contains(@class,'bg-[#121212]') and not(contains(@class,'border-dotted'))]",
      ),
    );

    expect(notes.length).to.equal(0);
    expect(add).to.not.be.null;
  });

  it("Negativa: No se rompe con contenido muy largo", async function () {
    const longContent = "A".repeat(1000);
    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Título normal");
    await driver.findElement(By.id("noteContent")).sendKeys(longContent);
    await driver.findElement(By.id("btnSave")).click();

    // Verificar que la nota se creó sin romper el layout
    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Título normal')]]",
      ),
    );
    expect(notes.length).to.equal(1);

    // Verificar que el contenido está truncado o visible correctamente
    const noteContent = await notes[0].findElement(
      By.xpath(".//p[@class='text-gray-300']"),
    );
    const contentText = await noteContent.getText();
    expect(contentText.length).to.be.greaterThan(0);
  });

  it("Límites: Layout responsive funciona correctamente", async function () {
    // Crear 6 notas
    for (let i = 1; i <= 6; i++) {
      await driver.findElement(By.id("btnAdd")).click();
      await driver.findElement(By.id("noteTitle")).sendKeys(`Nota ${i}`);
      await driver.findElement(By.id("noteContent")).sendKeys(`Contenido ${i}`);
      await driver.findElement(By.id("btnSave")).click();
    }

    // Verificar que todas se muestran
    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[@class='font-semibold text-lg mb-3']]",
      ),
    );
    expect(notes.length).to.equal(6);

    // Verificar que el grid se ve bien (no errores de layout)
    const container = await driver.findElement(By.id("notesContainer"));
    const isDisplayed = await container.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it("Límites: Muestra correctamente 10+ notas en el grid", async function () {
    // Crear 10 notas
    for (let i = 1; i <= 10; i++) {
      await driver.findElement(By.id("btnAdd")).click();
      await driver.findElement(By.id("noteTitle")).sendKeys(`Nota Test ${i}`);
      await driver
        .findElement(By.id("noteContent"))
        .sendKeys(`Contenido de prueba ${i}`);
      await driver.findElement(By.id("btnSave")).click();
    }

    // Verificar que las 10 notas están presentes
    const notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Test')]]",
      ),
    );
    expect(notes.length).to.equal(10);

    // Verificar en localStorage
    const raw = await driver.executeScript(
      "return localStorage.getItem('notes');",
    );
    const notesArray = raw ? JSON.parse(raw) : [];
    expect(notesArray.length).to.equal(10);
  });
});
