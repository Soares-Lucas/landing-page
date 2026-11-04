// Só o JavaScript novo da proposta, quando ela tem comportamento.
// Roda depois do script do index.html. Na implementação, vai para o <script> do fim do index.html.

// D4 · A inclinação 3D do terminal também no Clássico.
// No index.html, basta tirar o "if (root.getAttribute('data-theme') !== 'spatial') return;"
// do mousemove do hero; aqui, como o script de hoje não muda, o Clássico ganha um ouvinte igual.
(function () {
  var root = document.documentElement;
  var hero = document.getElementById('hero');
  var wrap = document.getElementById('terminal-wrap');
  var canTilt = window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canTilt) return;
  hero.addEventListener('mousemove', function (e) {
    if (root.getAttribute('data-theme') !== 'classic') return;
    var rect = hero.getBoundingClientRect();
    var x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 120) / 10;
    var y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * -120) / 10;
    wrap.style.transform = 'perspective(1000px) rotateY(' + x + 'deg) rotateX(' + y + 'deg)';
  });
})();
