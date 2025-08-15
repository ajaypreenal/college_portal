const stoken = localStorage.getItem('token');

function loadMy(){
  fetch('/api/attendance', { headers:{ Authorization: 'Bearer '+stoken }}).then(r=>r.json()).then(data=>{
    const tbody = $('#myAttendance tbody').empty();
    const myEmail = localStorage.getItem('email') || '';
    data.forEach(a=>{
      const present = a.present.includes(myEmail) ? 'Present' : 'Absent';
      $('#myAttendance tbody').append(`<tr><td>${a.date}</td><td>${a.courseCode}</td><td>${present}</td></tr>`);
    });
  });
}

// New attendance functionality
function loadStudentAttendance() {
  const course = document.getElementById('attendanceCourse').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  // Get current student ID from localStorage or user context
  const studentId = localStorage.getItem('userId') || getCurrentStudentId();
  
  if (!studentId) {
    alert('Student ID not found. Please log in again.');
    return;
  }

  let url = `/api/attendance/student/${studentId}`;
  const params = new URLSearchParams();
  
  if (course) params.append('course', course);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }

  fetch(url, { 
    headers: { Authorization: 'Bearer ' + stoken } 
  })
  .then(r => r.json())
  .then(data => {
    displayAttendanceSummary(data.summary);
    displayAttendanceRecords(data.records);
  })
  .catch(error => {
    console.error('Error loading attendance:', error);
    alert('Error loading attendance data');
  });
}

function displayAttendanceSummary(summary) {
  document.getElementById('totalClasses').textContent = summary.totalClasses;
  document.getElementById('presentCount').textContent = summary.presentCount;
  document.getElementById('absentCount').textContent = summary.absentCount;
  document.getElementById('attendancePercentage').textContent = summary.attendancePercentage + '%';
  document.getElementById('attendanceSummary').style.display = 'block';
}

function displayAttendanceRecords(records) {
  const tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = '';
  
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">No attendance records found</td></tr>';
  } else {
    records.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td>${record.course}</td>
        <td><span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">${record.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  }
  
  document.getElementById('attendanceRecords').style.display = 'block';
}

function getCurrentStudentId() {
  // This function should return the current student's ID
  // You might need to implement this based on your authentication system
  return localStorage.getItem('studentId');
}

// Set default dates (current month)
function setDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
  document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];
}

$(function(){ 
  loadMy(); 
  setDefaultDates();
  
  // Add event listener for attendance button
  const loadAttendanceBtn = document.getElementById('loadAttendanceBtn');
  if (loadAttendanceBtn) {
    loadAttendanceBtn.addEventListener('click', loadStudentAttendance);
  }
});
