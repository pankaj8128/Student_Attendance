document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lowAttendanceList").style.display = "none";
  document.getElementById("attendanceData").style.display = "none";
  document.getElementById("studentAttedanceData").style.display = "none";
  markAttendance();
});

// --- Set Date Input ---
document.querySelector(".date").value = new Date().toISOString().split("T")[0];
document.querySelector(".date").max = new Date().toISOString().split("T")[0];

// --- Read cookies helper ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.pop().split(";").shift().split("%20").join(" ");
}

// --- Logout Function ---
function logout() {
  fetch("/logout", { method: "POST", credentials: "include" }).then(() => {
    window.location.href = "/login";
  });
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    if (document.body.contains(notification))
      document.body.removeChild(notification);
  }, 2000);
}

function getLowAttendanceStudents() {
  document.getElementById("lowAttendanceList").style.display = "block";
  document.getElementById("attendanceForm").style.display = "none";
  document.getElementById("attendanceData").style.display = "none";
  document.getElementById("studentAttedanceData").style.display = "none";
  const subject = document.querySelector(".subject").value;
  if (!subject) {
    showNotification("Create Classes by Adding Subjects");
    return;
  }
  const url = `/attendance/less?subject=${encodeURIComponent(subject)}`;
  fetch(url, { credentials: "include" })
    .then((response) => {
      if (response.status === 401) return window.location.replace("/login");
      return response.json();
    })
    .then((data) => {
      const container = document.getElementById("lowAttendanceList");

      if (!data || data.length === 0) {
        container.innerHTML = "<p>No students below 75% attendance.</p>";
        return;
      }

      let html = `
        <h3>Students Below 75% Attendance</h3>
        <table class="low-attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Attendance (%)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach((student) => {
        html += `
          <tr>
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.attendance}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      container.innerHTML = html;
    })
    .catch((err) => {
      console.error("Error fetching students:", err);
      document.getElementById("lowAttendanceList").innerHTML =
        "<p>Error fetching data. Please try again later.</p>";
    });
  document.getElementById("lowAttendanceList").style.display = "block";
}

// --- Students & Attendance Form ---
async function markAttendance() {
  document.getElementById("attendanceForm").style.display = "block";
  document.getElementById("lowAttendanceList").style.display = "none";
  document.getElementById("attendanceData").style.display = "none";
  document.getElementById("studentAttedanceData").style.display = "none";
  const link = "/student";
  const subject = document.querySelector(".subject").value;
  if (!subject) {
    showNotification("Create Classes by Adding Subjects");
    return;
  }
  const url = `${link}?subject=${encodeURIComponent(subject)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  let students = await response.json();

  const form = document.getElementById("attendanceForm");
  form.innerHTML = "";

  if (!students.length) {
    let div = document.createElement("div");
    div.innerHTML = "Add students to mark attendance.";
    div.setAttribute("class", "no-students");
    form.innerHTML = "";
    form.appendChild(div);
    return;
  }

  let descriptionContainer = document.createElement("div");
  descriptionContainer.style.marginBottom = "15px";
  descriptionContainer.style.textAlign = "center";

  let descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "Description: ";
  descriptionLabel.style.marginRight = "10px";
  descriptionLabel.style.fontWeight = "bold";

  let descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.id = "description";
  descriptionInput.name = "description";
  descriptionInput.placeholder = "Enter description";
  descriptionInput.style.backgroundColor = "rgb(227 216 216)";
  descriptionInput.style.color = "rgb(48 36 36)";
  descriptionInput.style.padding = "8px";
  descriptionInput.style.borderRadius = "4px";
  descriptionInput.style.border = "none";
  descriptionInput.style.width = "60%";

  descriptionContainer.appendChild(descriptionLabel);
  descriptionContainer.appendChild(descriptionInput);
  form.appendChild(descriptionContainer);

  students.forEach((student) => {
    let row = document.createElement("div");
    row.classList.add("student-row");

    let studentIdDiv = document.createElement("div");
    studentIdDiv.style.width = "60px";
    studentIdDiv.style.textAlign = "center";
    studentIdDiv.textContent = student.student_id;

    let name = document.createElement("div");
    name.classList.add("student-name");
    name.textContent = student.first_name + " " + student.last_name;

    let hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "student_id";
    hiddenInput.value = student.student_id;

    // absent by default
    attendance[student.student_id] = "Absent";

    // present button
    let presentBtn = document.createElement("button");
    presentBtn.type = "button";
    presentBtn.classList.add("present-btn");
    presentBtn.textContent = "Present";
    presentBtn.onclick = () => {
      attendance[student.student_id] = "Present";
      presentBtn.style.opacity = "1";
      absentBtn.style.opacity = "0.4";
    };

    // absent button
    let absentBtn = document.createElement("button");
    absentBtn.type = "button";
    absentBtn.classList.add("absent-btn");
    absentBtn.textContent = "Absent";
    absentBtn.onclick = () => {
      attendance[student.student_id] = "Absent";
      absentBtn.style.opacity = "1";
      presentBtn.style.opacity = "0.4";
    };

    absentBtn.style.opacity = "1";
    presentBtn.style.opacity = "0.4";

    row.appendChild(studentIdDiv);
    row.appendChild(name);
    row.appendChild(hiddenInput);
    row.appendChild(presentBtn);
    row.appendChild(absentBtn);

    form.appendChild(row);
  });

  // Submit Button
  let submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Attendance";
  submitBtn.style.marginTop = "20px";
  form.appendChild(submitBtn);
}

let attendance = {};

// --- Submit Attendance ---
document
  .getElementById("attendanceForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const subject = document.querySelector(".subject").value;
    const description = document.querySelector("#description").value;
    const attendanceArray = Object.keys(attendance).map((id) => ({
      student_id: id,
      status: attendance[id],
    }));

    if (!subject) {
      showNotification("Create Classes by Adding Subjects");
      return;
    }
    const payload = {
      date: date,
      subject: subject,
      description: description,
      attendance: attendanceArray,
    };

    const response = await fetch("/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (response.status === 401) return window.location.replace("/login");
    if (response.ok) {
      showNotification("Attendance submitted successfully!");
      attendance = {};
      document.getElementById("attendanceForm").innerHTML = "";
    } else {
      showNotification("Error submitting attendance!");
    }
  });

async function getAttendanceData() {
  document.getElementById("lowAttendanceList").style.display = "none";
  document.getElementById("attendanceForm").style.display = "none";
  document.getElementById("studentAttedanceData").style.display = "none";
  const attendanceData = document.getElementById("attendanceData");
  const subject = document.querySelector(".subject").value;
  if (!subject) {
    showNotification("Create Classes by Adding Subjects");
    return;
  }
  attendanceData.innerHTML = "";
  attendanceData.style.display = "block";
  let data = await fetch(
    `/attendance/${document.getElementById("date").value}?subject=${subject}`,
    { credentials: "include" },
  );
  if (data.status === 401) return window.location.replace("/login");
  data = await data.json();

  if (!data.students.length) {
    let div = document.createElement("div");
    div.innerHTML = `Attendance is not marked for date ${document.getElementById("date").value}`;
    div.setAttribute("class", "attendance-data");
    attendanceData.innerHTML = "";
    attendanceData.appendChild(div);
    return;
  }

  let description = document.createElement("div");
  description.style.marginBottom = "15px";
  description.style.textAlign = "center";
  description.id = "description-container";

  let descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.id = "description-display";
  descriptionInput.name = "description";
  descriptionInput.value = data.description;
  descriptionInput.style.backgroundColor = "#2c2c2c";
  descriptionInput.style.color = "#f5f5f5";
  descriptionInput.style.padding = "8px";
  descriptionInput.style.borderRadius = "4px";
  descriptionInput.style.border = "none";
  descriptionInput.readOnly = true;

  description.appendChild(descriptionInput);

  attendanceData.appendChild(description);

  data.students.forEach((student) => {
    let row = document.createElement("div");
    row.classList.add("student-row");

    let studentIdDiv = document.createElement("div");
    studentIdDiv.style.width = "60px";
    studentIdDiv.style.textAlign = "center";
    studentIdDiv.textContent = student.student_id;

    let attendanceBtn = document.createElement("button");
    attendanceBtn.textContent = student.status;
    attendanceBtn.setAttribute("class", student.status.toLowerCase() + "-btn");
    attendanceBtn.style.opacity = "1";

    row.appendChild(studentIdDiv);
    row.appendChild(attendanceBtn);

    attendanceData.appendChild(row);
  });
}

document
  .getElementById("student-attendance-btn")
  .addEventListener("click", () => {
    document.getElementById("studentAttedanceData").style.display = "block";
    document.getElementById("attendanceData").style.display = "none";
    document.getElementById("lowAttendanceList").style.display = "none";
    document.getElementById("attendanceForm").style.display = "none";
  });

async function getStudentAttendance() {
  document.getElementById("data").innerHTML = "";
  const id = document.getElementById("id").value;
  if (!id || id === "") return showNotification("Enter valid Id");

  const subject = document.querySelector(".subject").value;
  if (!subject) return showNotification("Select Subject");

  const url = `/student/${id}?subject=${encodeURIComponent(subject)}`;
  let response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  response = await response.json();
  if (!response.student) {
    let div = document.createElement("div");
    div.innerHTML = `Student not found`;
    div.setAttribute("class", "attendance-data");
    document.getElementById("data").innerHTML = "";
    document.getElementById("data").appendChild(div);
    return;
  }

  const data_container = document.getElementById("studentAttedanceData");
  const data = document.getElementById("data");
  let html = `
        <table class="info">
            <tr>
                <th>Id</td>
                <th>Name</td>
                <th>Attendance</th>
            </tr>
            <tr>
                <td>${id}</td>
                <td>${response.student.first_name} ${response.student.last_name}</td>
                <td>${response.attendance}</td>
            </tr>
        </table>
        `;
  if (response.presentDates.length) {
    html += `<table class="present-dates">
            <tr><th>Present Dates</th></tr>`;
    response.presentDates.forEach((date) => {
      html += `<tr><td>${date}</td></tr>`;
    });
    html += `</table>`;
  }
  if (response.absentDates.length) {
    html += `</h2><table class="absent-dates">
            <tr><th>Absent Dates</th></tr>`;
    response.absentDates.forEach((date) => {
      html += `<tr><td>${date}</td></tr>`;
    });
    html += `</table>`;
  }

  data.innerHTML = html;
  data_container.appendChild(data);
}
// --- Add Class/Subject ---
const addClassForm = document.getElementById("addClassForm");
addClassForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject_name = document.getElementById("subjectName").value.trim();
  const semester = document.getElementById("semester").value.trim();

  if (!subject_name || !semester)
    return showNotification("Enter subject && semester");
  const url = `/teacher/class`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject: subject_name, semester }),
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  const data = await response.json();
  if (!response.ok) return showNotification(data.message);
  addClassForm.reset();
  location.reload(true);
});

// --- Enroll Student ---
const enrollStudentForm = document.getElementById("enrollStudentForm");
enrollStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const first_name = document.getElementById("firstName").value.trim();
  const last_name = document.getElementById("lastName").value.trim();

  if (!first_name || !last_name)
    return showNotification("All fields are required!");

  const subject = document.querySelector(".subject").value;
  if (!subject) return showNotification("Select Subject");

  const url = `/student/?subject=${encodeURIComponent(subject)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name }),
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  const data = await response.json();
  if (response.ok) {
    showNotification("Student enrolled successfully!");
    enrollStudentForm.reset();
    markAttendance();
  } else {
    showNotification(data.message);
  }
});

// --- Update Student ---
const updateStudentForm = document.getElementById("updateStudentForm");
updateStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("updateStudentId").value.trim();
  const first_name = document.getElementById("updateFirstName").value.trim();
  const last_name = document.getElementById("updateLastName").value.trim();

  if (!id || !first_name || !last_name) {
    showNotification("All fields are required!");
    return;
  }

  const response = await fetch("/student", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, first_name, last_name }),
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  if (response.ok) {
    showNotification("Student updated successfully!");
    updateStudentForm.reset();
    markAttendance();
  } else {
    showNotification("Error updating student!");
  }
});

// --- Delete Student ---
const deleteStudentForm = document.getElementById("deleteStudentForm");
deleteStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("deleteStudentId").value.trim();
  if (!id) {
    showNotification("ID is required!");
    return;
  }
  const subject = document.querySelector(".subject").value;
  if (!subject) return showNotification("Select Subject");

  const url = `/student/${id}?subject=${encodeURIComponent(subject)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (response.status === 401) return window.location.replace("/login");
  if (response.ok) {
    showNotification("Student deleted successfully!");
    deleteStudentForm.reset();
    markAttendance();
  } else {
    showNotification("Error deleting student!");
  }
});
