const btnAdd = document.getElementById("btnAdd");
const btnClose = document.getElementById("btnClose");
const btnCancel = document.getElementById("btnCancel");
const noteDialog = document.getElementById("noteDialog");
const noteForm = document.getElementById("noteForm");
const notesContainer = document.getElementById("notesContainer");

btnAdd.addEventListener("click", () => {
  noteDialog.showModal();
});

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

  const title = document.getElementById("noteTitle").value;
  const content = document.getElementById("noteContent").value;

  const noteCard = document.createElement("div");
  noteCard.className =
    "w-full min-h-[120px] p-5 bg-[#121212] rounded-md hover:bg-[#1a1a1a] transition-colors";
  noteCard.innerHTML = `
          <p class="font-semibold text-lg mb-3">${title}</p>
          <p class="text-gray-300">${content}</p>
        `;

  const addButton =
    notesContainer.querySelector(".border-dotted").parentElement;
  notesContainer.insertBefore(noteCard, addButton);

  noteDialog.close();
  noteForm.reset();
});
