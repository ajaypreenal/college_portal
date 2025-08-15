$(function(){
  
  const courses = [
    {code:'CS101', title:'Intro to Computer Science', credits:3},
    {code:'DS200', title:'Data Structures', credits:4},
    {code:'MT300', title:'Engineering Math', credits:3}
  ];
  let html = '';
  courses.forEach(c=>{
    html += `<div class="col-md-4"><div class="card mb-3"><div class="card-body"><h5 class="card-title">${c.title}</h5><p class="card-text text-muted">${c.code} • ${c.credits} credits</p></div></div></div>`;
  });
  $('#coursesRow').html(html);
});