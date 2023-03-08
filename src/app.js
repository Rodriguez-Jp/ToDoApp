//Global Variables
const form = document.querySelector("#form");
const toDolist = document.querySelector("#todos");
const toDoInput = document.querySelector("#todo-input");
const msjModal = document.querySelector("#msj-modal");
let todos = [];
let DB;

window.addEventListener("DOMContentLoaded", () => {
  form.addEventListener("submit", addToDo);
  createDB();
});

//Adds the ToDo
function addToDo(e) {
  e.preventDefault();

  //Validate
  if (!validateForm()) {
    showMessage("You can't  add an empty task!", "error");
    return;
  }

  //Create and add it to the db
  const id = Date.now();
  const newTodo = { id, todo: toDoInput.value, marked: false };
  const transaction = DB.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");
  objectStore.add(newTodo);

  displayTodos(todos);
  form.reset();
  showMessage("ToDo successfully added!", "success");
}

//Validates the form
function validateForm() {
  if (toDoInput.value.trim() === "") return false;

  return true;
}

//Displays all the todos saved in the todos array
function displayTodos() {
  cleanHTML();
  const objectStore = DB.transaction("todos").objectStore("todos");
  objectStore.openCursor().onsuccess = function (e) {
    const todoObj = e.target.result;
    if (todoObj) {
      const { id, todo, marked } = todoObj.value;
      //Scripting for each todo
      const divContainer = document.createElement("div");
      divContainer.classList.add(
        "w-full",
        "p-2",
        "flex",
        "justify-between",
        "items-center"
      );
      divContainer.dataset.id = id;

      const p = document.createElement("p");
      p.classList.add("p-2", "font-bold", "flex-1", "text-xl");
      p.textContent = todo;

      if (marked === true) {
        p.classList.add("text-slate-900/75", "line-through");
      }

      const divBtnContainer = document.createElement("div");
      divBtnContainer.classList.add("p-2", "flex");

      const finishedBtn = document.createElement("a");
      finishedBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      finishedBtn.href = "#";
      finishedBtn.classList.add("p-2", "text-white", "bg-green-500");
      finishedBtn.onclick = () => {
        markToDo(id);
      };

      const delBtn = document.createElement("a");
      delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
      delBtn.href = "#";
      delBtn.classList.add("p-2", "text-white", "bg-red-500");
      delBtn.onclick = () => {
        deleteToDo(id);
      };

      divBtnContainer.appendChild(finishedBtn);
      divBtnContainer.appendChild(delBtn);
      divContainer.appendChild(p);
      divContainer.appendChild(divBtnContainer);

      toDolist.appendChild(divContainer);

      todoObj.continue();
    }
  };
}

//Shows error message pop up
function showMessage(msj, type) {
  //Avoid multiple modals
  if (msjModal.firstChild) return;

  //In case error
  if (type === "error") {
    msjModal.classList.add("bg-red-500", "opacity-100");
    msjModal.classList.remove("opacity-0", "bg-green-500");

    const h2 = document.createElement("h2");
    h2.classList.add("text-white", "font-bold", "text-2xl");
    h2.textContent = "Error!";

    const p = document.createElement("p");
    p.classList.add("text-white", "text-center", "mt-5");
    p.textContent = msj;

    msjModal.appendChild(h2);
    msjModal.appendChild(p);

    setTimeout(() => {
      msjModal.classList.add("opacity-0");
      msjModal.classList.remove("opacity-100");
      while (msjModal.firstChild) {
        msjModal.firstChild.remove();
      }
    }, 2000);

    return;
  }

  //In case of success
  msjModal.classList.add("bg-green-500", "opacity-100");
  msjModal.classList.remove("opacity-0", "bg-red-500");

  const h2 = document.createElement("h2");
  h2.classList.add("text-white", "font-bold", "text-2xl");
  h2.textContent = "Success!";

  const p = document.createElement("p");
  p.classList.add("text-white", "text-center", "mt-5");
  p.textContent = msj;

  msjModal.appendChild(h2);
  msjModal.appendChild(p);

  setTimeout(() => {
    msjModal.classList.add("opacity-0");
    msjModal.classList.remove("opacity-100");
    while (msjModal.firstChild) {
      msjModal.firstChild.remove();
    }
  }, 2000);
}

//Clears the list
function cleanHTML() {
  while (toDolist.firstChild) {
    toDolist.firstChild.remove();
  }
}

//Mark the ToDo as done
function markToDo(idTodo) {
  const transaction = DB.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");

  const request = objectStore.get(idTodo);

  request.onsuccess = function () {
    const todo = request.result;

    todo.marked = true;

    const updateRequest = objectStore.put(todo);

    updateRequest.onsuccess = function () {
      displayTodos();
    };
  };
}

function deleteToDo(id) {
  const transaction = DB.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");
  objectStore.delete(id);
  displayTodos();
}

function createDB() {
  const createDB = window.indexedDB.open("todos", 1);

  createDB.onerror = function () {
    alert("Sorry, there was an error");
  };

  createDB.onsuccess = function () {
    DB = createDB.result;
    displayTodos();
  };

  createDB.onupgradeneeded = function (e) {
    const db = e.target.result;
    const objectStore = db.createObjectStore("todos", {
      keyPath: "id",
      autoIncrement: true,
    });
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("toDo", "toDo", { unique: false });
    objectStore.createIndex("marked", "marked", { unique: false });
  };
}
