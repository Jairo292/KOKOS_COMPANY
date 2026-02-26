document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    console.log("LOGIN:", email, password);
  });

  registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = registerForm.name.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const password2 = registerForm.password2.value;
    console.log("REGISTER:", name, email, password, password2);
  });

  const botoncito = document.getElementById('openAuth');
  const modal = document.getElementById('authModal');

  console.log("se cargo", botoncito, modal);
  if(!botoncito || !modal) return;

  botoncito.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('is-open');
    setTab("login"); // abre siempre en login
  });

  modal.addEventListener('click', (e) => {
    if(e.target.dataset.close !== undefined){
      modal.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') modal.classList.remove('is-open');
  });

  const pestanas = modal.querySelectorAll("[data-tab]");
  const paneles = modal.querySelectorAll("[data-panel]");
  const switchers = modal.querySelectorAll("[data-switch]");

  function setearTab(name) {
    pestanas.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
    paneles.forEach(p => p.classList.toggle("is-active", p.dataset.panel === name));
  }

  pestanas.forEach(btn => {
    btn.addEventListener("click", () => {
      setearTab(btn.dataset.tab);
    });
  });

  switchers.forEach(btn => {
    btn.addEventListener("click", () => {
      setearTab(btn.dataset.switch);
    });
  });

});