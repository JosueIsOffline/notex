let notes = [];
let editingNoteId = null;
const btnAdd = document.getElementById("btnAdd");
const btnClose = document.getElementById("btnClose");
const btnCancel = document.getElementById("btnCancel");
const noteDialog = document.getElementById("noteDialog");
const noteForm = document.getElementById("noteForm");
const notesContainer = document.getElementById("notesContainer");

// Load note data
const loadNotes = () => {
  const savedNotes = localStorage.getItem("notes");
  notes = savedNotes ? JSON.parse(savedNotes) : [];
  renderNotes();
};

// Save notes
const saveNotes = () => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const openDialog = (noteId = null) => {
  noteDialog.showModal();
  const title = document.getElementById("noteTitle");
  const content = document.getElementById("noteContent");

  if (noteId) {
    const noteToEdit = notes.find((note) => note.id === noteId);
    document.getElementById("headerDialog").textContent = "Editar nota";
    document.getElementById("btnSave").textContent = "Editar";
    editingNoteId = noteId;
    title.value = noteToEdit.title;
    content.value = noteToEdit.content;
  } else {
    document.getElementById("headerDialog").textContent = "Crear nota";
    document.getElementById("btnSave").textContent = "Guardar";
    editingNoteId = null;
    title.value = "";
    content.value = "";
  }
};

// Render notes
const renderNotes = () => {
  notesContainer.innerHTML =
    notes
      .map(
        (n) => `
      <div class="w-full min-h-[120px] p-5 bg-[#121212] rounded-md hover:bg-[#1a1a1a] transition-colors relative">
        <div class="absolute top-1 right-4">
          <div class="flex flex-row gap-3">
            <button onClick="openDialog(${n.id})">E</button>
            <button onClick="deleteNote(${n.id})">D</button>
          </div>
        </div>
        <p class="font-semibold text-lg mb-3">${n.title}</p>
        <p class="text-gray-300">${n.content}</p>
      </div>
    `,
      )
      .join("") +
    `
    <div class="flex justify-center items-center w-full min-h-[120px] p-5 bg-[#121212]/60 border-2 border-purple-500 border-dotted rounded-md transition-colors">
      <button id="btnAdd" class="bg-purple-500 hover:bg-purple-500/80 rounded-md px-4 py-2 h-10 transition-colors">
        <p class="text-lg font-bold">Add note <span class="text-lg">+</span></p>
      </button>
    </div>
  `;

  // Re-attach event listener
  document.getElementById("btnAdd").addEventListener("click", () => {
    openDialog();
  });
};

// Add or edit note
const addNote = () => {
  const title = document.getElementById("noteTitle").value;
  const content = document.getElementById("noteContent").value;

  if (editingNoteId) {
    const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content,
    };
    saveNotes();
    renderNotes();
    noteDialog.close();
    noteForm.reset();
    return;
  }

  const newNote = {
    id: Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  notes.push(newNote);
  saveNotes();
  renderNotes();

  noteDialog.close();
  noteForm.reset();
};

// Delete note
const deleteNote = (id) => {
  if (!id) throw new Error("Should provide an id");

  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes();
};

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadNotes();

  btnClose.addEventListener("click", () => {
    noteDialog.close();
    noteForm.reset();
  });

  btnCancel.addEventListener("click", () => {
    noteDialog.close();
    noteForm.reset();
  });

  noteDialog.addEventListener("click", (e) => {
    if (e.target === noteDialog) {
      noteDialog.close();
      noteForm.reset();
    }
  });

  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addNote();
  });
});
