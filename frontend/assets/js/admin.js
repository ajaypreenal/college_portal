const token = localStorage.getItem('token');

function loadStudents(){
  fetch('/api/students', { headers:{ Authorization: 'Bearer '+token } })
    .then(r=>r.json()).then(data=>{
      const tbody = $('#studentsTable tbody').empty();
      data.forEach(s=> {
        const row = `
          <tr>
            <td>${s.name || 'N/A'}</td>
            <td>${s.email || 'N/A'}</td>
            <td>${s.class || 'N/A'}</td>
            <td>${s.rollNumber || 'N/A'}</td>
            <td>${s.course || 'N/A'}</td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="deleteStudent('${s._id}')">Delete</button>
            </td>
          </tr>
        `;
        tbody.append(row);
      });
    })
    .catch(error => {
      console.error('Error loading students:', error);
      alert('Error loading students. Please refresh the page.');
    });
}

function loadCourses(){
  fetch('/api/courses', { headers:{ Authorization: 'Bearer '+token } })
    .then(r=>r.json()).then(data=>{
      const tbody = $('#coursesTable tbody').empty();
      data.forEach(c=> tbody.append(`<tr><td>${c.code}</td><td>${c.title}</td><td>${c.credits||''}</td><td><button class="btn btn-sm btn-danger" onclick="deleteCourse('${c._id}')">Delete</button></td></tr>`));
    });
}

$('#addStudentBtn').on('click', ()=> new bootstrap.Modal(document.getElementById('studentModal')).show());
$('#addCourseBtn').on('click', ()=> new bootstrap.Modal(document.getElementById('courseModal')).show());

$('#studentForm').on('submit', function(e){
  e.preventDefault();
  
  const studentData = {
    name: $('#s_name').val().trim(),
    email: $('#s_email').val().trim(),
    password: $('#s_password').val(),
    class: $('#s_class').val(),
    rollNumber: $('#s_rollNumber').val() ? parseInt($('#s_rollNumber').val()) : undefined,
    course: $('#s_course').val(),
    role: 'student' // Always set role as student for admin-created users
  };

  // Validate required fields
  if (!studentData.name || !studentData.email || !studentData.password || !studentData.class) {
    alert('Please fill in all required fields: Name, Email, Password, and Class');
    return;
  }

  fetch('/api/students', { 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + token
    }, 
    body: JSON.stringify(studentData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
      if (data.message.includes('created') || data.message.includes('success')) {
        loadStudents();
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        // Reset form
        $('#studentForm')[0].reset();
      }
    } else {
      alert('Student created successfully!');
      loadStudents();
      bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
      $('#studentForm')[0].reset();
    }
  })
  .catch(error => {
    console.error('Error creating student:', error);
    alert('Error creating student. Please try again.');
  });
});

$('#courseForm').on('submit', function(e){
  e.preventDefault();
  const body = { code: $('#c_code').val(), title: $('#c_title').val(), credits: $('#c_credits').val()};
  fetch('/api/courses', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify(body)}).then(()=>{ loadCourses(); bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();});
});

function deleteStudent(id){
  fetch('/api/students/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token }}).then(()=>loadStudents());
}
function deleteCourse(id){
  fetch('/api/courses/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token }}).then(()=>loadCourses());
}

// Attendance management functions
function loadAdminAttendance() {
  const className = document.getElementById('adminClassSelect').value;
  const courseName = document.getElementById('adminCourseSelect').value;
  const date = document.getElementById('adminDateSelect').value;
  
  let url = '/api/attendance';
  
  if (date) {
    url = `/api/attendance/date/${date}`;
  } else if (className && courseName) {
    url = `/api/attendance/course/${encodeURIComponent(courseName)}/class/${encodeURIComponent(className)}`;
  } else if (className) {
    // Load students for the class and then their attendance
    loadClassAttendance(className);
    return;
  } else if (courseName) {
    // Load course attendance across all classes
    loadCourseAttendance(courseName);
    return;
  } else {
    // Load all attendance records
    loadAllAttendance();
    return;
  }
  
  fetch(url, { 
    headers: { Authorization: 'Bearer ' + token } 
  })
  .then(r => r.json())
  .then(data => {
    displayAdminAttendance(data);
  })
  .catch(error => {
    console.error('Error loading attendance:', error);
    alert('Error loading attendance data');
  });
}

function loadClassAttendance(className) {
  // First get students in the class
  fetch(`/api/attendance/students/class/${className}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(students => {
    // Then get attendance for each student
    Promise.all(students.map(student => 
      fetch(`/api/attendance/student/${student._id}`, {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json())
    ))
    .then(attendanceData => {
      const allRecords = [];
      attendanceData.forEach(data => {
        if (data.records) {
          allRecords.push(...data.records);
        }
      });
      displayAdminAttendance(allRecords);
    });
  });
}

function loadCourseAttendance(courseName) {
  // Load attendance for specific course across all classes
  fetch(`/api/attendance/course/${encodeURIComponent(courseName)}/class/all`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(data => {
    if (data.studentAttendance) {
      const allRecords = [];
      data.studentAttendance.forEach(student => {
        allRecords.push(...student.attendance);
      });
      displayAdminAttendance(allRecords);
    } else {
      displayAdminAttendance([]);
    }
  });
}

function loadAllAttendance() {
  // Load recent attendance records (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  fetch(`/api/attendance/date/${startDate.toISOString().split('T')[0]}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(data => {
    displayAdminAttendance(data);
  });
}

function displayAdminAttendance(records) {
  const tbody = document.getElementById('adminAttendanceTableBody');
  tbody.innerHTML = '';
  
  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No attendance records found</td></tr>';
  } else {
    records.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.student?.name || 'N/A'}</td>
        <td>${record.student?.class || 'N/A'}</td>
        <td>${record.student?.rollNumber || 'N/A'}</td>
        <td>${record.course || 'N/A'}</td>
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td><span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">${record.status}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  document.getElementById('adminAttendanceReport').style.display = 'block';
}

$(function(){ 
  loadStudents(); 
  loadCourses(); 
  
  // Add event listener for admin attendance button
  const loadAdminAttendanceBtn = document.getElementById('loadAdminAttendanceBtn');
  if (loadAdminAttendanceBtn) {
    loadAdminAttendanceBtn.addEventListener('click', loadAdminAttendance);
  }
  
  // Set default date to today
  const adminDateSelect = document.getElementById('adminDateSelect');
  if (adminDateSelect) {
    adminDateSelect.value = new Date().toISOString().split('T')[0];
  }
});
