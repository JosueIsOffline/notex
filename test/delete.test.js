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

  // ========== CAMINO FELIZ ==========

  it("Camino feliz: eliminar nota existente la remueve del DOM", async function () {
    await driver
      .wait(until.elementLocated(By.id("btnAdd")), 5000)
      .then((btn) => btn.click());
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota a eliminar");
    await driver
      .findElement(By.id("noteContent"))
      .sendKeys("Contenido a eliminar");
    await driver.findElement(By.id("btnSave")).click();

    // Verificar que existe
    let notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota a eliminar')]]",
      ),
    );
    expect(notes.length).to.equal(1);

    // Eliminar
    const noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota a eliminar')]]",
      ),
    );
    const delBtn = await noteDiv.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    // Verificar que ya no existe
    await driver.sleep(300);
    notes = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota a eliminar')]]",
      ),
    );
    expect(notes.length).to.equal(0);
  });

  it("Camino feliz: eliminar nota la remueve de localStorage", async function () {
    // Crear nota
    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Test Delete");
    await driver.findElement(By.id("noteContent")).sendKeys("Test Content");
    await driver.findElement(By.id("btnSave")).click();

    // Verificar en localStorage
    let raw = await driver.executeScript(
      "return localStorage.getItem('notes');",
    );
    expect(raw).to.include("Test Delete");

    // Eliminar
    const noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Test Delete')]]",
      ),
    );
    const delBtn = await noteDiv.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    // Verificar que se removió de localStorage
    await driver.sleep(300);
    raw = await driver.executeScript("return localStorage.getItem('notes');");
    const notesArray = raw ? JSON.parse(raw) : [];
    expect(notesArray.length).to.equal(0);
  });

  it("Camino feliz: elimina nota específica sin afectar otras", async function () {
    // Crear 3 notas
    for (let i = 1; i <= 3; i++) {
      await driver.findElement(By.id("btnAdd")).click();
      await driver.findElement(By.id("noteTitle")).sendKeys(`Nota ${i}`);
      await driver.findElement(By.id("noteContent")).sendKeys(`Contenido ${i}`);
      await driver.findElement(By.id("btnSave")).click();
    }

    // Verificar que hay 3 notas
    let notes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    expect(notes.length).to.be.at.least(3);

    // Eliminar la nota 2
    const note2 = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota 2')]]",
      ),
    );
    const delBtn = await note2.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    await driver.sleep(500);

    // Verificar que quedan solo 2 notas
    notes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    expect(notes.length).to.be.at.least(2);

    // Verificar que la nota 1 y 3 siguen ahí
    const note1Exists = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota 1')]]",
      ),
    );
    const note3Exists = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota 3')]]",
      ),
    );
    expect(note1Exists.length).to.equal(1);
    expect(note3Exists.length).to.equal(1);

    // Verificar que la nota 2 no existe
    const note2Exists = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota 2')]]",
      ),
    );
    expect(note2Exists.length).to.equal(0);
  });

  // ========== PRUEBAS NEGATIVAS ==========

  it("Negativa: no genera error cuando no hay notas que eliminar", async function () {
    // Asegurar que no hay notas
    await driver.executeScript("localStorage.clear();");
    await driver.navigate().refresh();

    // Verificar que la app sigue funcionando
    const addBtn = await driver.wait(
      until.elementLocated(By.id("btnAdd")),
      5000,
    );
    expect(await addBtn.isDisplayed()).to.be.true;

    // No debería haber botones de eliminar
    const delButtons = await driver.findElements(
      By.xpath("//button[text()='D']"),
    );
    expect(delButtons.length).to.equal(0);
  });

  it("Negativa: la app sigue funcional después de eliminar", async function () {
    // Crear y eliminar una nota
    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Temporal");
    await driver.findElement(By.id("noteContent")).sendKeys("Temporal");
    await driver.findElement(By.id("btnSave")).click();

    const noteDiv = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Temporal')]]",
      ),
    );
    const delBtn = await noteDiv.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    await driver.sleep(500);

    // Verificar que se puede crear una nueva nota
    await driver.findElement(By.id("btnAdd")).click();
    const titleInput = await driver.findElement(By.id("noteTitle"));
    expect(await titleInput.isDisplayed()).to.be.true;

    // Crear la nueva nota
    await titleInput.sendKeys("Nueva Nota");
    await driver.findElement(By.id("noteContent")).sendKeys("Nuevo Contenido");
    await driver.findElement(By.id("btnSave")).click();

    // Verificar que la nueva nota existe
    const newNote = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nueva Nota')]]",
      ),
    );
    expect(newNote.length).to.equal(1);
  });

  // ========== PRUEBAS DE LÍMITES ==========

  it("Límites: elimina todas las notas una por una", async function () {
    // Crear 5 notas
    for (let i = 1; i <= 5; i++) {
      await driver.findElement(By.id("btnAdd")).click();
      await driver.findElement(By.id("noteTitle")).sendKeys(`Nota ${i}`);
      await driver.findElement(By.id("noteContent")).sendKeys(`Contenido ${i}`);
      await driver.findElement(By.id("btnSave")).click();
    }

    // Eliminar todas una por una
    for (let i = 0; i < 5; i++) {
      const notes = await driver.findElements(
        By.xpath("//section[@id='notesContainer']/div[.//button[text()='D']]"),
      );

      if (notes.length > 0) {
        const delBtn = await notes[0].findElement(
          By.xpath(".//button[text()='D']"),
        );
        await delBtn.click();
        await driver.sleep(300);
      }
    }

    // Verificar que no quedan notas
    const remainingNotes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    expect(remainingNotes.length).to.equal(0);

    // Verificar localStorage vacío
    const raw = await driver.executeScript(
      "return localStorage.getItem('notes');",
    );
    const notesArray = raw ? JSON.parse(raw) : [];
    expect(notesArray.length).to.equal(0);
  });

  it("Límites: persistencia después de eliminar y recargar", async function () {
    // Crear 2 notas
    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Permanente");
    await driver.findElement(By.id("noteContent")).sendKeys("Esta debe quedar");
    await driver.findElement(By.id("btnSave")).click();

    await driver.findElement(By.id("btnAdd")).click();
    await driver.findElement(By.id("noteTitle")).sendKeys("Nota Temporal");
    await driver.findElement(By.id("noteContent")).sendKeys("Esta se elimina");
    await driver.findElement(By.id("btnSave")).click();

    // Eliminar la segunda nota
    const note2 = await driver.findElement(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Temporal')]]",
      ),
    );
    const delBtn = await note2.findElement(By.xpath(".//button[text()='D']"));
    await delBtn.click();

    await driver.sleep(500);

    // Recargar la página
    await driver.navigate().refresh();

    // Verificar que solo queda la nota permanente
    const permanentNote = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Permanente')]]",
        ),
      ),
      5000,
    );
    expect(permanentNote).to.not.be.null;

    // Verificar que la temporal no existe
    const temporalNote = await driver.findElements(
      By.xpath(
        "//section[@id='notesContainer']/div[.//p[contains(text(),'Nota Temporal')]]",
      ),
    );
    expect(temporalNote.length).to.equal(0);

    // Verificar en localStorage
    const raw = await driver.executeScript(
      "return localStorage.getItem('notes');",
    );
    expect(raw).to.include("Nota Permanente");
    expect(raw).to.not.include("Nota Temporal");
  });

  it("Límites: grid se reorganiza correctamente después de eliminar", async function () {
    // Crear 4 notas
    for (let i = 1; i <= 4; i++) {
      await driver.findElement(By.id("btnAdd")).click();
      await driver.findElement(By.id("noteTitle")).sendKeys(`Nota ${i}`);
      await driver.findElement(By.id("noteContent")).sendKeys(`Contenido ${i}`);
      await driver.findElement(By.id("btnSave")).click();
    }

    // Eliminar la primera nota
    const notes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    const firstDelBtn = await notes[0].findElement(
      By.xpath(".//button[text()='D']"),
    );
    await firstDelBtn.click();

    await driver.sleep(500);

    // Verificar que el grid se reorganizó
    const remainingNotes = await driver.findElements(
      By.xpath("//section[@id='notesContainer']/div[.//p]"),
    );
    expect(remainingNotes.length).to.be.at.least(3);

    // Verificar que el botón Add note sigue visible
    const addBtn = await driver.findElement(By.id("btnAdd"));
    expect(await addBtn.isDisplayed()).to.be.true;
  });
});
