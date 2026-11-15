import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const db = getFirestore(initializeApp(firebaseConfig));
const tareas = collection(db, "tareas");

const $form = document.getElementById("form-nueva");
const $titulo = document.getElementById("titulo");
const $lista = document.getElementById("lista");
const $estado = document.getElementById("estado");
const $contador = document.getElementById("contador");

function mostrarEstado(texto, esError = false) {
  $estado.textContent = texto;
  $estado.classList.toggle("error", esError);
}

async function intentar(accion) {
  try {
    await accion();
  } catch (e) {
    console.error(e);
    mostrarEstado("No se pudo guardar el cambio: " + e.code, true);
  }
}

// CREATE
$form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const titulo = $titulo.value.trim();
  if (!titulo) return;
  $titulo.value = "";
  intentar(() => addDoc(tareas, { titulo, completada: false, creadaEn: serverTimestamp() }));
});

function fila(id, t) {
  const li = document.createElement("li");
  if (t.completada) li.classList.add("completada");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = t.completada;
  check.setAttribute("aria-label", "Marcar como completada");
  // UPDATE (estado)
  check.addEventListener("change", () =>
    intentar(() => updateDoc(doc(tareas, id), { completada: check.checked })));

  const titulo = document.createElement("span");
  titulo.className = "titulo";
  titulo.textContent = t.titulo;

  const editar = document.createElement("button");
  editar.textContent = "Editar";
  // UPDATE (título)
  editar.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 120;
    input.value = t.titulo;
    titulo.replaceWith(input);
    input.focus();
    let cerrado = false;
    const guardar = () => {
      if (cerrado) return;
      cerrado = true;
      const nuevo = input.value.trim();
      input.replaceWith(titulo);
      if (nuevo && nuevo !== t.titulo) {
        intentar(() => updateDoc(doc(tareas, id), { titulo: nuevo }));
      }
    };
    input.addEventListener("blur", guardar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") guardar();
      if (e.key === "Escape") { input.value = t.titulo; guardar(); }
    });
  });

  const borrar = document.createElement("button");
  borrar.textContent = "Eliminar";
  // DELETE
  borrar.addEventListener("click", () => intentar(() => deleteDoc(doc(tareas, id))));

  li.append(check, titulo, editar, borrar);
  return li;
}

// READ en tiempo real: Firestore envía cada cambio de la colección.
onSnapshot(
  query(tareas, orderBy("creadaEn", "desc")),
  (snap) => {
    $lista.replaceChildren(...snap.docs.map((d) => fila(d.id, d.data())));
    const pendientes = snap.docs.filter((d) => !d.data().completada).length;
    $contador.textContent = `${pendientes} pendiente(s) de ${snap.size}`;
    mostrarEstado(snap.empty ? "Aún no hay tareas. Agrega la primera." : "");
  },
  (e) => {
    console.error(e);
    mostrarEstado("No se pudo leer Firestore: " + e.code, true);
  }
);
