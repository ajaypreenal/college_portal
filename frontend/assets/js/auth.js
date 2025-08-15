$('#loginForm').on('submit', async function(e){
  e.preventDefault();
  const email = $('#email').val();
  const password = $('#password').val();

  try {
    const res = await fetch('/api/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('email', data.user.email);
      if (data.user.role === 'admin') location.href = 'admin.html';
      else if (data.user.role === 'faculty') location.href = 'faculty.html';
      else location.href = 'student.html';
    } else {
      $('#loginMsg').text(data.message || 'Login failed').css('color','red');
    }
  } catch (err) {
    $('#loginMsg').text('Server error').css('color','red');
  }
});