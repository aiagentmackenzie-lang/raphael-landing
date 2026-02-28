// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {

// Reveal animations on scroll - EXCLUDE chat-section from auto-reveal
const revealItems = document.querySelectorAll('.section:not(.chat-section), .hero, .card, .cta, .step');

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

// ========== CHAT WIDGET ==========
const chatMessages = document.getElementById('chat-messages');
const categoryBubbles = document.getElementById('category-bubbles');
const chatForm = document.getElementById('chat-form');
const formCategory = document.getElementById('form-category');
const painInputs = {
  pain1: document.getElementById('form-pain1'),
  pain2: document.getElementById('form-pain2'),
  pain3: document.getElementById('form-pain3'),
  pain4: document.getElementById('form-pain4'),
  comments: document.getElementById('form-comments')
};
const emailHidden = document.getElementById('form-email-hidden');
const emailInput = document.getElementById('email-input');

let currentStep = 0;
let answers = {};
let selectedCategory = '';
let nameCaptured = '';

// Universal questions for everyone
const questions = [
  "What are you building? Try to describe it in one sentence.",
  "What's the manual step or problem you're dealing with right now?",
  "Do you have any rough timeline or budget expectations?",
  "What's your name?",
  "Anything else you want to add? (optional)"
];

// Type message into chat with typing indicator
function typeMessage(text, isUser = false, callback) {
  // Hide typing indicator if present
  const existingTyping = chatMessages.querySelector('.typing');
  if (existingTyping) {
    existingTyping.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message--${isUser ? 'user' : 'bot'}`;
  messageDiv.innerHTML = isUser 
    ? `<div class="message__name">You</div>${text}`
    : `<div class="message__name">AI Assistant</div>${text}`;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Call callback after message appears
  if (callback) {
    setTimeout(callback, 600);
  }
}

// Show typing indicator
function showTyping(callback) {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message message--bot typing';
  typingDiv.innerHTML = `
    <div class="typing__dot"></div>
    <div class="typing__dot"></div>
    <div class="typing__dot"></div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  if (callback) {
    setTimeout(callback, 800);
  }
}

// Create and show input box
function showInput(placeholder = "Type your answer...") {
  // Remove any existing input first
  const existingInput = chatMessages.querySelector('.message-input');
  if (existingInput) {
    existingInput.remove();
  }
  
  const inputDiv = document.createElement('div');
  inputDiv.className = 'message message--user message-input';
  inputDiv.innerHTML = `
    <div class="message__name">You</div>
    <input type="text" 
           placeholder="${placeholder}" 
           class="chat-inline-input"
           style="background: transparent; border: none; border-bottom: 1px solid var(--neon); color: var(--text); font-family: inherit; font-size: 0.95rem; width: 100%; outline: none; padding: 8px 0;"
           autofocus>
  `;
  chatMessages.appendChild(inputDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  const input = inputDiv.querySelector('input');
  input.focus();
  
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
      const answer = this.value.trim();
      // Replace input with plain text message
      inputDiv.innerHTML = `<div class="message__name">You</div>${answer}`;
      inputDiv.classList.remove('message-input');
      handleAnswer(answer);
    }
  });
  
  // Also handle blur to refocus
  input.addEventListener('blur', () => {
    setTimeout(() => input.focus(), 100);
  });
}

// Create and show HUGE textarea for final comments
function showBigTextarea(placeholder = "Add any details...") {
  // Remove any existing input first
  const existingInput = chatMessages.querySelector('.message-input, .big-textarea-input');
  if (existingInput) {
    existingInput.remove();
  }
  
  const textareaDiv = document.createElement('div');
  textareaDiv.className = 'message message--user big-textarea-input';
  textareaDiv.style.maxWidth = '95%';
  textareaDiv.style.padding = '20px';
  textareaDiv.style.background = 'rgba(83, 249, 255, 0.08)';
  textareaDiv.style.border = '2px solid var(--neon)';
  textareaDiv.style.borderRadius = '16px';
  textareaDiv.style.boxShadow = '0 0 30px rgba(83, 249, 255, 0.15)';
  
  textareaDiv.innerHTML = `
    <div class="message__name" style="margin-bottom: 12px; font-size: 1.1rem;">You — Ramble Mode 📝</div>
    <textarea 
      placeholder="${placeholder}" 
      class="chat-big-textarea"
      style="background: rgba(0,0,0,0.5); border: 1px solid rgba(83, 249, 255, 0.3); border-radius: 12px; color: var(--text); font-family: inherit; font-size: 1.05rem; width: 100%; outline: none; padding: 20px; resize: vertical; min-height: 180px; line-height: 1.7;"
      rows="8"
      autofocus
    ></textarea>
    <div style="margin-top: 14px; font-size: 0.85rem; color: var(--neon); opacity: 0.8;">
      💡 <strong>Tip:</strong> Press Enter for new lines • Press Enter <em>twice quickly</em> to continue
    </div>
  `;
  chatMessages.appendChild(textareaDiv);
  
  // Scroll to show the full textarea (it's larger than regular inputs)
  setTimeout(() => {
    textareaDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
  
  const textarea = textareaDiv.querySelector('textarea');
  textarea.focus();
  
  let enterCount = 0;
  let lastEnterTime = 0;
  
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      const now = Date.now();
      if (now - lastEnterTime < 800) {
        enterCount++;
      } else {
        enterCount = 1;
      }
      lastEnterTime = now;
      
      if (enterCount >= 2) {
        e.preventDefault();
        const answer = textarea.value.trim();
        textareaDiv.innerHTML = `<div class="message__name">You</div>${answer || '(nothing to add)'}`;
        textareaDiv.classList.remove('big-textarea-input');
        textareaDiv.style.cssText = '';
        textarea.removeEventListener('keydown', handleEnter);
        
        // Email form should appear next
        setTimeout(() => {
          handleAnswer(answer);
        }, 200);
      }
    }
  };
  
  textarea.addEventListener('keydown', handleEnter);
  
  // Also handle blur to refocus
  textarea.addEventListener('blur', () => {
    setTimeout(() => textarea.focus(), 100);
  });
}

// Keep old name for compatibility
function showTextarea(placeholder) {
  showBigTextarea(placeholder);
}

// Handle category selection
categoryBubbles.querySelectorAll('.category-bubble').forEach(bubble => {
  // Add keyboard accessibility
  bubble.setAttribute('tabindex', '0');
  bubble.setAttribute('role', 'button');
  bubble.setAttribute('aria-pressed', 'false');
  
  const selectCategory = function(e) {
    e.preventDefault();
    
    // Remove selected from all
    categoryBubbles.querySelectorAll('.category-bubble').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed', 'false');
    });
    
    // Add selected to clicked
    this.classList.add('selected');
    this.setAttribute('aria-pressed', 'true');
    
    // Store category
    selectedCategory = this.dataset.category;
    formCategory.value = selectedCategory;
    
    // Hide category bubbles after selection
    categoryBubbles.style.display = 'none';
    
    // Add user message
    const categoryLabel = this.querySelector('.category-bubble__label').textContent;
    typeMessage(`I'm building a ${categoryLabel} project.`, true);
    
    // Start questions after brief delay
    setTimeout(() => {
      startDiscovery();
    }, 600);
  };
  
  bubble.addEventListener('click', selectCategory);
  bubble.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      selectCategory.call(this, e);
    }
  });
});

// Start discovery questions
function startDiscovery() {
  currentStep = 0;
  answers = {};
  
  showTyping(() => {
    typeMessage(questions[0], false, () => {
      showInput("e.g., A dashboard for tracking...");
    });
  });
}

// Handle answer and proceed
function handleAnswer(answer) {
  // Store answer
  const questionKey = `pain${currentStep + 1}`;
  answers[questionKey] = answer;
  
  // Store in correct hidden field
  if (currentStep === 4) {
    painInputs.comments.value = answer || '(no additional comments)';
  } else {
    painInputs[questionKey].value = answer;
  }
  
  // If name question (step 3), store it
  if (currentStep === 3) {
    nameCaptured = answer;
  }
  
  currentStep++;
  
  // Step 5 = After comments, show email form
  if (currentStep === 5) {
    // All questions done, show email
    showTyping(() => {
      typeMessage(`Thanks, ${nameCaptured || 'there'}! Where should I send your project brief?`, false, () => {
        chatForm.classList.add('visible');
        emailInput.focus();
      });
    });
  } else if (currentStep < 5) {
    // Next question (steps 1-4)
    showTyping(() => {
      typeMessage(questions[currentStep], false, () => {
        const placeholders = [
          "e.g., A dashboard for tracking...",
          "e.g., Manually copying data between...",
          "e.g., 2-3 months, flexible...",
          "Your first name...",
          ""
        ];
        
        if (currentStep === 4) {
          // Step 4 = Comments textarea (BIG)
          showBigTextarea("Add any details, constraints, or wild ideas... (press Enter twice when done)");
        } else {
          showInput(placeholders[currentStep]);
        }
      });
    });
  }
}

// Handle form submission
let isSubmitting = false;

chatForm.addEventListener('submit', function(e) {
  // Prevent double submission
  if (isSubmitting) {
    e.preventDefault();
    return;
  }
  
  // Email validation
  const email = emailInput.value.trim();
  if (!email || !email.includes('@')) {
    e.preventDefault();
    emailInput.style.borderColor = '#ff453a';
    emailInput.placeholder = 'Please enter a valid email';
    return;
  }
  
  // Update hidden email field
  emailHidden.value = email;
  
  // Simulate submission delay
  e.preventDefault();
  isSubmitting = true;
  
  // Disable submit button
  const submitBtn = chatForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
  }
  
  // Show user message with email
  typeMessage(email, true);
  chatForm.classList.remove('visible');
  
  // Actually submit the form after showing the message
  setTimeout(() => {
    const formData = new FormData(chatForm);
    
    fetch(chatForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        showTyping(() => {
          typeMessage("Perfect! Your project brief is on its way. I'll review it and be in touch within 24 hours. 🤖", false);
        });
      } else {
        throw new Error('Submission failed');
      }
    }).catch(error => {
      showTyping(() => {
        typeMessage("Hmm, something went wrong. Email me directly at aiagent.mackenzie@gmail.com 🤖", false);
      });
      // Re-enable form on error
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send me my brief →';
        submitBtn.style.opacity = '1';
      }
    });
  }, 600);
});

// ========== BACK TO TOP ==========

const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  // Scroll to top on click
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

}); // End DOMContentLoaded
