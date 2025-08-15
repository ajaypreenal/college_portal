const ftoken = localStorage.getItem('token');

$('#attendanceForm').on('submit', function(e){
  e.preventDefault();
  const body = { courseCode: $('#f_course').val(), date: $('#f_date').val(), present: $('#f_present').val().split(',').map(s=>s.trim()) };
  fetch('/api/attendance', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+ftoken }, body: JSON.stringify(body)}).then(r=>r.json()).then(()=>{
    loadAttendance();
    alert('Attendance saved');
  });
});

function loadAttendance(){
  fetch('/api/attendance', { headers:{ Authorization: 'Bearer '+ftoken }}).then(r=>r.json()).then(data=>{
    const tbody = $('#attendanceTable tbody').empty();
    data.forEach(a=> tbody.append(`<tr><td>${a.date}</td><td>${a.courseCode}</td><td>${a.present.join(', ')}</td></tr>`));
  });
}

$(function(){ loadAttendance(); });
