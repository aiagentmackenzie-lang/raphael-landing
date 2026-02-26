// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Reveal animations on scroll
const revealItems = document.querySelectorAll('.section, .hero, .card, .cta, .step');

revealItems.forEach((item) => item.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Add stagger delay for cards within sections
        if (entry.target.classList.contains('cards')) {
          const cards = entry.target.querySelectorAll('.card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, index * 100);
          });
        }
      }
    });
  },
  { 
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  }
);

revealItems.forEach((item) => observer.observe(item));

// Orb follow mouse effect
const orb = document.querySelector('.orb');

if (orb) {
  window.addEventListener('mousemove', (event) => {
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 12;
    const y = (event.clientY / innerHeight - 0.5) * 12;

    orb.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// Add visible class to cards initially in view
document.querySelectorAll('.card').forEach(card => {
  card.classList.add('reveal');
});
