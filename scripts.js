// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Interactive navigation
    const sections = document.querySelectorAll('section');
    const nav = createNavigation(sections);
    document.querySelector('header').appendChild(nav);

    // Phase hover effects
    const phases = document.querySelectorAll('.phase');
    phases.forEach(phase => {
        phase.addEventListener('mouseenter', () => {
            phase.style.transform = 'translateX(10px)';
        });
        phase.addEventListener('mouseleave', () => {
            phase.style.transform = 'translateX(0)';
        });
    });

    // Back to top button
    const backToTopBtn = createBackToTopButton();
    document.body.appendChild(backToTopBtn);

    // Form validation and handling
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Add real-time validation
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', () => {
            if (input.hasAttribute('data-error')) {
                validateField.call(input);
            }
        });
    });
});

// Create navigation menu
function createNavigation(sections) {
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    const ul = document.createElement('ul');
    sections.forEach(section => {
        if (section.id) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${section.id}`;
            a.textContent = section.querySelector('h2').textContent;
            
            // Smooth scroll
            a.addEventListener('click', (e) => {
                e.preventDefault();
                section.scrollIntoView({ behavior: 'smooth' });
            });
            
            li.appendChild(a);
            ul.appendChild(li);
        }
    });
    
    nav.appendChild(ul);
    return nav;
}

// Create back to top button
function createBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.textContent = '↑';
    button.title = 'Back to top';
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    return button;
}

// Form validation and handling
function validateField() {
    const field = this;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error messages
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Validate based on field type
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'text':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'This field must be at least 2 characters long';
            }
            break;
        case 'select-one':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select an option';
            }
            break;
        case 'textarea':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Please enter at least 10 characters';
            }
            break;
    }

    // Add error message if validation failed
    if (!isValid) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875em';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = errorMessage;
        field.parentElement.appendChild(errorDiv);
        field.setAttribute('data-error', 'true');
    } else {
        field.removeAttribute('data-error');
    }

    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formStatus = document.getElementById('form-status');
    const formInputs = form.querySelectorAll('input, textarea, select');
    
    // Validate all fields
    let isValid = true;
    formInputs.forEach(input => {
        if (!validateField.call(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showFormStatus('Please fix the errors in the form', 'error');
        return;
    }

    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate form submission
    showFormStatus('Sending message...', 'info');
    
    // In a real application, you would send this data to a server
    setTimeout(() => {
        console.log('Form data:', data);
        showFormStatus('Message sent successfully!', 'success');
        form.reset();
    }, 1500);
}

function showFormStatus(message, type) {
    const formStatus = document.getElementById('form-status');
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
} 