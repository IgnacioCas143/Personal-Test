
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = Array.from({ length: 15 }, (_, i) => 7 + i);

let members = JSON.parse(localStorage.getItem("members")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || [];

let selectedMember = null;
let selectedDay = null;

let editingIndex = null;
let editingMemberIndex = null;
let selectedPattern = "";

// DOM

const schedule = document.getElementById("schedule");
const memberList = document.getElementById("memberList");

const modal = document.getElementById("modal");
const memberModal = document.getElementById("memberModal");

// clase
const memberSelect = document.getElementById("memberSelect");
const daySelect = document.getElementById("daySelect");
const hourSelect = document.getElementById("hourSelect");
const durationInput = document.getElementById("durationInput");

// integrante
const memberNameInput = document.getElementById("memberNameInput");
const memberColorInput = document.getElementById("memberColorInput");


// STORAGE

function saveData() {
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("classes", JSON.stringify(classes));
}


// GRID

function generateGrid() {
  schedule.innerHTML = "";
  schedule.appendChild(document.createElement("div"));

  days.forEach((day, i) => {
    let cell = document.createElement("div");
    cell.className = "cell header";
    cell.textContent = day;
    cell.onclick = () => highlightDay(i);
    schedule.appendChild(cell);
  });

  hours.forEach(hour => {
    let h = document.createElement("div");
    h.className = "cell hour";
    h.textContent = `${hour}:00`;
    schedule.appendChild(h);

    days.forEach((_, d) => {
      let c = document.createElement("div");
      c.className = "cell";
      c.dataset.day = d;
      c.dataset.hour = hour;
      schedule.appendChild(c);
    });
  });

  renderBlocks();

}


// BLOQUES (CLASES)

function renderBlocks() {
  document.querySelectorAll(".block").forEach(el => el.remove());

  classes.forEach((c, index) => {
    let member = members.find(m => m.name === c.member);
    if (!member) return;

    let startCell = document.querySelector(
      `.cell[data-day="${c.day}"][data-hour="${c.start}"]`
    );

    if (!startCell) return;

    let block = document.createElement("div");
    block.className = `block ${member.pattern}`;
    block.style.backgroundColor = member.color;
    block.style.height = `${c.duration * 50 - 4}px`;
    block.dataset.member = member.name;

    block.onclick = (e) => {
      e.stopPropagation();
      openClassModal(index);
    };

    startCell.appendChild(block);
  });
}


// HEATMAP

function applyHeatmap() {
  let map = {};

  classes.forEach(c => {
    for (let i = 0; i < c.duration; i++) {
      let key = `${c.day}-${c.start + i}`;
      map[key] = (map[key] || 0) + 1;
    }
  });

  document.querySelectorAll(".cell").forEach(cell => {
    let key = `${cell.dataset.day}-${cell.dataset.hour}`;
    let count = map[key] || 0;

    cell.style.backgroundColor =
      count > 0 ? `rgba(255,0,0,${count * 0.15})` : "#161b22";
  });
}


// MEMBERS

function renderMembers() {
  memberList.innerHTML = "";

  members.forEach((m, index) => {
    let li = document.createElement("li");

    let box = document.createElement("div");
    box.className = "color-box";
    box.style.background = m.color;

    li.appendChild(box);
    li.append(m.name);

    // highlight
    li.onclick = () => highlightMember(m.name, li);

    // eliminar
    li.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm("¿Eliminar integrante?")) {
        members.splice(index, 1);
        classes = classes.filter(c => c.member !== m.name);
        saveData();
        renderMembers();
        generateGrid();
      }
    };

    // editar
    li.ondblclick = () => openMemberModal(index);

    memberList.appendChild(li);
  });
}


// FILTROS

function highlightMember(name, el) {
  // 🔁 toggle OFF
  if (selectedMember === name) {
    selectedMember = null;

    document.querySelectorAll(".block").forEach(b => {
      b.classList.remove("active-member", "dimmed");
    });

    document.querySelectorAll(".sidebar li").forEach(li =>
      li.classList.remove("active")
    );

    return;
  }

  selectedMember = name;
  selectedDay = null;

  document.querySelectorAll(".block").forEach(b => {
    if (b.dataset.member === name) {
      b.classList.add("active-member"); // 👈 z-index 1000
      b.classList.remove("dimmed");
    } else {
      b.classList.remove("active-member");
      b.classList.add("dimmed");
    }
  });

  document.querySelectorAll(".sidebar li").forEach(li =>
    li.classList.remove("active")
  );

  el.classList.add("active");
}

function highlightDay(d) {
  if (selectedDay === d) {
    selectedDay = null;
    document.querySelectorAll(".cell").forEach(c => c.classList.remove("dimmed"));
    return;
  }

  selectedDay = d;
  selectedMember = null;

  document.querySelectorAll(".cell").forEach(c => {
    c.classList.toggle("dimmed", c.dataset.day != d);
  });
}


// MODAL CLASES

document.getElementById("addClassBtn").onclick = () => {
  editingIndex = null;
  modal.classList.remove("hidden");
  loadClassForm();
};

function openClassModal(index) {
  editingIndex = index;
  modal.classList.remove("hidden");
  loadClassForm();

  let c = classes[index];
  memberSelect.value = c.member;
  daySelect.value = c.day;
  hourSelect.value = c.start;
  durationInput.value = c.duration;
}

function loadClassForm() {
  memberSelect.innerHTML = "";
  daySelect.innerHTML = "";
  hourSelect.innerHTML = "";

  members.forEach(m => memberSelect.add(new Option(m.name, m.name)));
  days.forEach((d, i) => daySelect.add(new Option(d, i)));
  hours.forEach(h => hourSelect.add(new Option(`${h}:00`, h)));
}

document.getElementById("saveClass").onclick = () => {
  let data = {
    member: memberSelect.value,
    day: parseInt(daySelect.value),
    start: parseInt(hourSelect.value),
    duration: parseInt(durationInput.value)
  };

  if (editingIndex !== null) {
    classes[editingIndex] = data;
  } else {
    classes.push(data);
  }

  saveData();
  modal.classList.add("hidden");
  generateGrid();
};

document.getElementById("deleteClass").onclick = () => {
  if (editingIndex === null) return;

  if (confirm("¿Eliminar clase?")) {
    classes.splice(editingIndex, 1);
    saveData();
    modal.classList.add("hidden");
    generateGrid();
  }
};

document.getElementById("closeModal").onclick = () =>
  modal.classList.add("hidden");

// MODAL MIEMBROS

const patternBoxes = document.querySelectorAll(".pattern-box");

patternBoxes.forEach(box => {
  box.onclick = () => {
    selectedPattern = box.dataset.pattern;
    updatePatternUI();
  };
});

function updatePatternUI() {
  patternBoxes.forEach(box => {
    box.classList.toggle(
      "active",
      box.dataset.pattern === selectedPattern
    );
  });
}

function openMemberModal(index) {
  editingMemberIndex = index;

  let m = members[index];

  memberModal.classList.remove("hidden");
  memberNameInput.value = m.name;
  memberColorInput.value = m.color;
  selectedPattern = m.pattern;
  updatePatternColors(m.color);
  updatePatternUI();
}

function updatePatternColors(color) {
  document.querySelectorAll(".pattern-box").forEach(box => {
    box.style.backgroundColor = color;
  });
}
// Guardar miembro
document.getElementById("saveMember").onclick = () => {
  let data = {
    name: memberNameInput.value,
    color: memberColorInput.value,
    pattern: selectedPattern
  };

  if (editingMemberIndex !== null) {
    members[editingMemberIndex] = data;
  } else {
    members.push(data);
  }

  saveData();
  memberModal.classList.add("hidden");
  renderMembers();
  generateGrid();
};

// Eliminar -Member
document.getElementById("deleteMember").onclick = () => {
  if (editingMemberIndex === null) return;

  if (confirm("¿Eliminar integrante?")) {
    let name = members[editingMemberIndex].name;

    members.splice(editingMemberIndex, 1);
    classes = classes.filter(c => c.member !== name);

    saveData();
    memberModal.classList.add("hidden");
    renderMembers();
    generateGrid();
  }
};

document.getElementById("closeMemberModal").onclick = () =>
  memberModal.classList.add("hidden");


// Add Member

document.getElementById("addMemberBtn").onclick = () => {
  editingMemberIndex = null;

  memberModal.classList.remove("hidden");
  memberNameInput.value = "";
  memberColorInput.value = "#a855f7";
  selectedPattern = "";

  updatePatternUI();
};

generateGrid();
renderMembers();