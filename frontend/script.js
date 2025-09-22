const server = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lowAttendanceList').style.display = "none";
    setTimeout(() => {
        showNotification(`Your Id is ${getCookie('id')}`);
    }, 1000);
});

// --- Set Date Input ---
document.querySelector('.date').value = new Date().toISOString().split('T')[0];
document.querySelector('.date').max = new Date().toISOString().split('T')[0];

// --- Read cookies helper ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) 
    return parts.pop().split(';').shift().split('%20').join(' ');
}

// --- Teacher Name Button, subject ---
const id = getCookie('id');
const teacherFirstName = getCookie('first_name');
const teacherLastName = getCookie('last_name');
const subject = getCookie('subject');
document.getElementById('teacherBtn').textContent =
    id && teacherFirstName && teacherLastName ? `${teacherFirstName} ${teacherLastName} (${id})` : 'Teacher';
document.getElementById('subjectBtn').textContent = 
    id && teacherFirstName && teacherLastName ? `${subject}`: 'Subject';

// --- Logout Function ---
function logout() {
  document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "first_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "last_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "subject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = '/';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if(document.body.contains(notification))
            document.body.removeChild(notification);
    }, 2000);
}

function getLowAttendanceStudents() {
  fetch(server + '/attendance/less') 
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('lowAttendanceList');

      if (!data || data.length === 0) {
        container.innerHTML = '<p>No students below 75% attendance.</p>';
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

      data.forEach(student => {
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
    .catch(err => {
      console.error('Error fetching students:', err);
      document.getElementById('lowAttendanceList').innerHTML =
        '<p>Error fetching data. Please try again later.</p>';
    });
    document.getElementById('lowAttendanceList').style.display = "block";
}

// --- Students & Attendance Form ---
async function markAttendance() {
  document.getElementById('lowAttendanceList').style.display = "none";
  let link = server + '/student';
  const response = await fetch(link);
  const students = await response.json();

  const form = document.getElementById('attendanceForm');
  form.innerHTML = '';

  if(!students.length) {
    let div = document.createElement('div');
    div.innerHTML = 'Add students to mark attendance.';
    div.setAttribute('class', 'no-students');
    form.innerHTML = '';
    form.appendChild(div);
    return;
  }

  let topicContainer = document.createElement('div');
  topicContainer.style.marginBottom = '15px';
  topicContainer.style.textAlign = 'center';

  let topicLabel = document.createElement('label');
  topicLabel.textContent = 'Topic: ';
  topicLabel.style.marginRight = '10px';
  topicLabel.style.fontWeight = 'bold';

  let topicInput = document.createElement('input');
  topicInput.type = 'text';
  topicInput.id = 'topic';
  topicInput.name = 'topic';
  topicInput.placeholder = 'Enter topic';
  topicInput.style.backgroundColor = '#2c2c2c';
  topicInput.style.color = '#f5f5f5';
  topicInput.style.padding = '8px';
  topicInput.style.borderRadius = '4px';
  topicInput.style.border = 'none';
  topicInput.style.width = '60%';

  topicContainer.appendChild(topicLabel);
  topicContainer.appendChild(topicInput);
  form.appendChild(topicContainer);

  students.forEach((student) => {
    let row = document.createElement('div');
    row.classList.add('student-row');

    let studentIdDiv = document.createElement('div');
    studentIdDiv.style.width = '60px';
    studentIdDiv.style.textAlign = 'center';
    studentIdDiv.textContent = student.student_id;

    let name = document.createElement('div');
    name.classList.add('student-name');
    name.textContent = student.first_name + ' ' + student.last_name;

    let hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'student_id';
    hiddenInput.value = student.student_id;

    // absent by default
    attendance[student.student_id] = 'Absent';

    // present button
    let presentBtn = document.createElement('button');
    presentBtn.type = 'button';
    presentBtn.classList.add('present-btn');
    presentBtn.textContent = 'Present';
    presentBtn.onclick = () => {
      attendance[student.student_id] = 'Present';
      presentBtn.style.opacity = '1';
      absentBtn.style.opacity = '0.4';
    };

    // absent button
    let absentBtn = document.createElement('button');
    absentBtn.type = 'button';
    absentBtn.classList.add('absent-btn');
    absentBtn.textContent = 'Absent';
    absentBtn.onclick = () => {
      attendance[student.student_id] = 'Absent';
      absentBtn.style.opacity = '1';
      presentBtn.style.opacity = '0.4';
    };

    absentBtn.style.opacity = '1';
    presentBtn.style.opacity = '0.4';

    row.appendChild(studentIdDiv);
    row.appendChild(name);
    row.appendChild(hiddenInput);
    row.appendChild(presentBtn);
    row.appendChild(absentBtn);

    form.appendChild(row);
  });

  // Submit Button 
  let submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Submit Attendance';
  submitBtn.style.marginTop = '20px';
  form.appendChild(submitBtn);
}

let attendance = {};

// --- Submit Attendance ---
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const topic = document.getElementById('topic').value;

  const attendanceArray = Object.keys(attendance).map(id => ({
    student_id: id,
    status: attendance[id]
  }));

  const payload = {
    date: date,
    topic: topic,
    attendance: attendanceArray
  };

  const response = await fetch(server + '/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    showNotification('Attendance submitted successfully!');
    attendance = {};
    document.getElementById('attendanceForm').innerHTML = '';
    document.getElementById('topic').value = ''; // clear after submit
  } else {
    showNotification('Error submitting attendance!');
  }
});

// --- Add Student ---
const addStudentForm = document.getElementById('addStudentForm');
addStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('studentId').value.trim();
  const first_name = document.getElementById('firstName').value.trim();
  const last_name = document.getElementById('lastName').value.trim();

  if (!id || !first_name || !last_name) {
    showNotification('All fields are required!');
    return;
  }

  const response = await fetch(server + '/student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, first_name, last_name })
  });

  if (response.ok) {
    showNotification('Student added successfully!');
    addStudentForm.reset();
    markAttendance();
  } else {
    showNotification('Error adding student!');
  }
});

// --- Update Student ---
const updateStudentForm = document.getElementById('updateStudentForm');
updateStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('updateStudentId').value.trim();
  const first_name = document.getElementById('updateFirstName').value.trim();
  const last_name = document.getElementById('updateLastName').value.trim();

  if (!id || !first_name || !last_name) {
    showNotification('All fields are required!');
    return;
  }

  const response = await fetch(server + '/student', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, first_name, last_name })
  });

  if (response.ok) {
    showNotification('Student updated successfully!');
    updateStudentForm.reset();
    markAttendance();
  } else {
    showNotification('Error updating student!');
  }
});

// --- Delete Student ---
const deleteStudentForm = document.getElementById('deleteStudentForm');
deleteStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('deleteStudentId').value.trim();
  if (!id) {
    showNotification('ID is required!');
    return;
  }

  const response = await fetch(server + '/student/' + id, {
    method: 'DELETE'
  });

  if (response.ok) {
    showNotification('Student deleted successfully!');
    deleteStudentForm.reset();
    markAttendance();
  } else {
    showNotification('Error deleting student!');
  }
});
