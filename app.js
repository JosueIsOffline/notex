let notes = [];
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

// Render notes
const renderNotes = () => {
  notesContainer.innerHTML =
    notes
      .map(
        (n) => `
      <div class="w-full min-h-[120px] p-5 bg-[#121212] rounded-md hover:bg-[#1a1a1a] transition-colors">
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

  // Re-attach event listener to new button
  document.getElementById("btnAdd").addEventListener("click", () => {
    noteDialog.showModal();
  });
};

// Add new note
const addNote = () => {
  const title = document.getElementById("noteTitle").value;
  const content = document.getElementById("noteContent").value;

  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    createdAt: new Date().toISOString(),
  };

  notes.push(newNote);
  saveNotes();
  renderNotes();

  noteDialog.close();
  noteForm.reset();
};

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadNotes();

  // Close dialog events
  btnClose.addEventListener("click", () => {
    noteDialog.close();
    noteForm.reset();
  });

  btnCancel.addEventListener("click", () => {
    noteDialog.close();
    noteForm.reset();
  });

  // Close on backdrop click
  noteDialog.addEventListener("click", (e) => {
    if (e.target === noteDialog) {
      noteDialog.close();
      noteForm.reset();
    }
  });

  // Form submit
  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addNote();
  });
});
