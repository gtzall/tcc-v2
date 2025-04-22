const { navLinks } = require("./script");

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Previne o comportamento padrão do link
        const target = link.getAttribute('data-target');
        mostrarAba(target);
    });
});
