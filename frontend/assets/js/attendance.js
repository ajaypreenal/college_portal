document.addEventListener('DOMContentLoaded', () => {
  const classSelect = document.getElementById('classSelect');
  const courseSelect = document.getElementById('courseSelect');
  const dateInput = document.getElementById('attendanceDate');
  const studentList = document.getElementById('studentList');
  const submitBtn = document.getElementById('submitBtn');
  const messageDiv = document.getElementById('message');

  // Set default date to today
  dateInput.value = new Date().toISOString().split('T')[0];

  // Load students when class is selected
  classSelect.addEventListener('change', async () => {
    if (classSelect.value) {
      await loadStudents(classSelect.value);
    } else {
      studentList.innerHTML = '<p class="text-muted">Select a class to load students...</p>';
      submitBtn.disabled = true;
    }
  });

  // Handle attendance submission
  submitBtn.addEventListener('click', handleAttendanceSubmission);

  async function loadStudents(className) {
    try {
      messageDiv.innerHTML = '<div class="alert alert-info">Loading students...</div>';
      
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/attendance/students/class/${className}`, {
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const students = await response.json();
      displayStudents(students);
      messageDiv.innerHTML = '';
      
    } catch (error) {
      console.error('Error loading students:', error);
      messageDiv.innerHTML = '<div class="alert alert-danger">Error loading students. Please try again.</div>';
      studentList.innerHTML = '<p class="text-muted">Error loading students...</p>';
    }
  }

  function displayStudents(students) {
    if (students.length === 0) {
      studentList.innerHTML = '<p class="text-muted">No students found in this class.</p>';
      submitBtn.disabled = true;
      return;
    }

    let html = '<h5 class="mb-3">Mark students as present:</h5>';
    students.forEach(student => {
      html += `
        <div class="student-item">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${student._id}" id="student${student._id}">
            <label class="form-check-label" for="student${student._id}">
              <strong>${student.name}</strong>
              ${student.rollNumber ? ` (Roll: ${student.rollNumber})` : ''}
              <span class="text-muted"> - ${student.class}</span>
            </label>
          </div>
        </div>
      `;
    });

    studentList.innerHTML = html;
    submitBtn.disabled = false;
  }

  async function handleAttendanceSubmission() {
    const course = courseSelect.value;
    const date = dateInput.value;
    const className = classSelect.value;

    if (!course || !date || !className) {
      messageDiv.innerHTML = '<div class="alert alert-warning">Please select class, course, and date.</div>';
      return;
    }

    const presentStudents = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
      presentStudents.push(checkbox.value);
    });

    if (presentStudents.length === 0) {
      messageDiv.innerHTML = '<div class="alert alert-warning">Please select at least one student as present.</div>';
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      messageDiv.innerHTML = '<div class="alert alert-warning">Please <a href="/login.html">login</a> first to mark attendance.</div>';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      messageDiv.innerHTML = '<div class="alert alert-info">Saving attendance...</div>';

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course,
          date,
          present: presentStudents
        })
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        // Reset form
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        submitBtn.textContent = 'Submit Attendance';
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        submitBtn.textContent = 'Submit Attendance';
      }
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      messageDiv.innerHTML = '<div class="alert alert-danger">Error saving attendance. Please try again.</div>';
      submitBtn.textContent = 'Submit Attendance';
    } finally {
      submitBtn.disabled = false;
    }
  }

  // Add some utility functions
  window.resetAttendanceForm = () => {
    classSelect.value = '';
    courseSelect.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
    studentList.innerHTML = '<p class="text-muted">Select a class to load students...</p>';
    submitBtn.disabled = true;
    messageDiv.innerHTML = '';
  };

  // Add reset button functionality
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn btn-secondary ms-2';
  resetBtn.textContent = 'Reset Form';
  resetBtn.onclick = window.resetAttendanceForm;
  submitBtn.parentNode.appendChild(resetBtn);
});
