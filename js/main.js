// Auto-update Month and Year of the document
(function updateTimestamp() {
  const dateSpan = document.getElementById('last-updated');
  if (dateSpan && document.lastModified) {
    const d = new Date(document.lastModified);
    if (!isNaN(d.getTime())) {
      dateSpan.textContent = d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
  }

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
})();

/* ===== DARK MODE ===== */
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
}
/* ===== END DARK MODE ===== */
