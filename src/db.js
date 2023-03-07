document.addEventListener("DOMContentLoaded", () => {
  crearDB();
});

function crearDB() {
  const crearDB = window.indexedDB.open("todos", 1);

  crearDB.onerror = function () {
    alert("Sorry, there was an error");
  };
}
