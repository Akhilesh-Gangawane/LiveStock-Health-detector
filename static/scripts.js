// Enhanced FarmCare Pro JavaScript with Modern Features
class FarmCareProEnhanced {
    constructor() {
        this.init();
        this.setupAnimations();
        this.setupInteractions();
        this.setupFormValidation();
        this.setupTheme();
    }

    init() {
        console.log('🚀 FarmCare Pro Enhanced System Loaded');
        this.setupAnimalBreedHandler();
        this.setupScrollAnimations();
        this.setupParticleBackground();
        this.setupProgressiveEnhancement();
    }

    setupAnimalBreedHandler() {
        const animalSelect = document.getElementById('animal_type');
        const breedSelect = document.getElementById('breed');
        
        if (animalSelect && breedSelect) {
            animalSelect.addEventListener('change', async (e) => {
                const animalType = e.target.value;
                
                if (animalType) {
                    this.showLoadingState(breedSelect);
                    
                    try {
                        const response = await fetch(`/get_breeds/${animalType}`);
                        const breeds = await response.json();
                        
                        this.populateBreeds(breedSelect, breeds);
                        this.animateElement(breedSelect, 'fadeInUp');
                        this.showNotification(`Loaded ${breeds.length} breeds for ${animalType}`, 'success');
                    } catch (error) {
                        console.error('Error loading breeds:', error);
                        breedSelect.innerHTML = '<option value="">Error loading breeds</option>';
                        this.showNotification('Error loading breeds', 'error');
                    }
                } else {
                    breedSelect.innerHTML = '<option value="">First select animal type</option>';
                }
            });
            
            // Auto-select Dog for demo with delay
            setTimeout(() => {
                animalSelect.value = 'Dog';
                animalSelect.dispatchEvent(new Event('change'));
            }, 1000);
        }
    }

    showLoadingState(element) {
        element.innerHTML = '<option value="">🔄 Loading breeds...</option>';
        element.classList.add('loading');
    }

    populateBreeds(breedSelect, breeds) {
        breedSelect.innerHTML = '<option value="">Select Breed</option>';
        breeds.forEach((breed, index) => {
            setTimeout(() => {
                const option = document.createElement('option');
                option.value = breed;
                option.textContent = breed;
                breedSelect.appendChild(option);
            }, index * 50); // Staggered animation
        });
        breedSelect.classList.remove('loading');
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.feature-card, .action-btn, .disease-card, .prediction-form, .quick-actions').forEach(el => {
            observer.observe(el);
        });
    }

    setupParticleBackground() {
        // Particle background disabled to prevent emoji overflow
        // Can be re-enabled by uncommenting the code below
        
        /*
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // Skip animations for users who prefer reduced motion
        }

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);

        const particles = ['🐄', '🐷', '🐑', '🐴', '🐕', '🐈', '🐓', '🦆', '🐰', '🐐'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createParticle(particleContainer, particles);
            }, i * 2000);
        }

        // Continuously add particles
        setInterval(() => {
            if (particleContainer.children.length < 20) {
                this.createParticle(particleContainer, particles);
            }
        }, 5000);
        */
    }

    createParticle(container, particles) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 15 + 20) + 's';
        
        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 25000);
    }

    setupInteractions() {
        // Enhanced button interactions with ripple effect
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRippleEffect(e);
            });
        });

        // Enhanced card hover effects
        document.querySelectorAll('.feature-card, .disease-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateElement(card, 'pulse');
            });

            card.addEventListener('click', () => {
                this.animateElement(card, 'bounceIn');
            });
        });

        // Symptom card interactions
        document.querySelectorAll('.symptom-card').forEach(card => {
            card.addEventListener('click', () => {
                this.toggleSymptomCard(card);
            });
        });

        // Form field enhancements
        document.querySelectorAll('.form-control, .form-select').forEach(field => {
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('field-focused');
            });

            field.addEventListener('blur', () => {
                field.parentElement.classList.remove('field-focused');
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    toggleSymptomCard(card) {
        const checkbox = card.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {
            card.classList.add('selected');
            this.animateElement(card, 'bounceIn');
        } else {
            card.classList.remove('selected');
            this.animateElement(card, 'fadeOut');
            setTimeout(() => {
                card.classList.remove('fadeOut');
            }, 300);
        }

        // Update symptom counter
        this.updateSymptomCounter();
    }

    updateSymptomCounter() {
        const selectedSymptoms = document.querySelectorAll('.symptom-card.selected').length;
        const counter = document.getElementById('symptom-counter');
        if (counter) {
            counter.textContent = `${selectedSymptoms} symptoms selected`;
            this.animateElement(counter, 'pulse');
        }
    }

    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 600);
    }

    setupFormValidation() {
        const form = document.querySelector('form[action="/predict"]');
        if (form) {
            // Real-time validation
            form.querySelectorAll('[required]').forEach(field => {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });

                field.addEventListener('input', () => {
                    if (field.classList.contains('is-invalid')) {
                        this.validateField(field);
                    }
                });
            });

            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showNotification('Please fill in all required fields correctly', 'warning');
                    this.focusFirstInvalidField(form);
                } else {
                    this.showLoadingOverlay();
                }
            });
        }
    }

    validateField(field) {
        const isValid = field.value.trim() !== '';
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        return isValid;
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    focusFirstInvalidField(form) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>🤖 AI Analysis in Progress</h3>
                <p>Analyzing symptoms and vital signs...</p>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
                <small>This may take a few moments...</small>
            </div>
        `;
        document.body.appendChild(overlay);

        // Simulate progress
        const progressBar = overlay.querySelector('.progress-bar');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }, 200);

        // Clean up if form actually submits
        setTimeout(() => {
            clearInterval(interval);
        }, 5000);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        const timeout = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(timeout);
            this.removeNotification(notification);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    removeNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    setupTheme() {
        // Theme switcher functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Apply saved theme
        const savedTheme = localStorage.getItem('farmcare-theme');
        if (savedTheme) {
            document.body.classList.add(savedTheme);
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('farmcare-theme', 'light-theme');
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('farmcare-theme', 'dark-theme');
        }

        this.showNotification(`Switched to ${isDark ? 'light' : 'dark'} theme`, 'info', 2000);
    }

    setupProgressiveEnhancement() {
        // Add progressive enhancement features
        this.setupKeyboardNavigation();
        this.setupAccessibilityFeatures();
        this.setupPerformanceOptimizations();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modals
                const modal = document.querySelector('.voice-modal');
                if (modal) {
                    modal.remove();
                }
            }

            if (e.ctrlKey && e.key === 'Enter') {
                // Quick submit form
                const form = document.querySelector('form[action="/predict"]');
                if (form && this.validateForm(form)) {
                    form.submit();
                }
            }
        });
    }

    setupAccessibilityFeatures() {
        // Add ARIA labels and descriptions
        document.querySelectorAll('.symptom-card').forEach((card, index) => {
            card.setAttribute('role', 'checkbox');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-describedby', `symptom-desc-${index}`);
        });

        // Add focus management
        document.querySelectorAll('.symptom-card').forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleSymptomCard(card);
                }
            });
        });
    }

    setupPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-view', isMobile);
    }

    // Voice prediction with enhanced UI
    showVoicePrediction() {
        const modal = document.createElement('div');
        modal.className = 'voice-modal';
        modal.innerHTML = `
            <div class="voice-modal-content">
                <div class="voice-modal-header">
                    <h3><i class="fas fa-microphone"></i> Voice Health Assessment</h3>
                    <button class="voice-modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="voice-modal-body">
                    <div class="voice-animation">
                        <div class="voice-wave"></div>
                        <div class="voice-wave"></div>
                        <div class="voice-wave"></div>
                        <div class="voice-wave"></div>
                    </div>
                    <p>Describe your animal's symptoms clearly. Speak naturally and include details about:</p>
                    <ul class="voice-tips">
                        <li>Animal type and breed</li>
                        <li>Observed symptoms</li>
                        <li>Duration of symptoms</li>
                        <li>Behavioral changes</li>
                    </ul>
                    <div class="voice-controls">
                        <button class="btn btn-primary" id="startRecording">
                            <i class="fas fa-microphone"></i> Start Recording
                        </button>
                        <button class="btn btn-secondary" id="stopRecording" style="display: none;">
                            <i class="fas fa-stop"></i> Stop Recording
                        </button>
                    </div>
                    <div class="voice-transcript" style="display: none;">
                        <h5>Transcript:</h5>
                        <p id="transcriptText"></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.voice-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Simulate voice recording
        const startBtn = modal.querySelector('#startRecording');
        const stopBtn = modal.querySelector('#stopRecording');
        
        startBtn.addEventListener('click', () => {
            this.simulateVoiceRecording(modal);
        });
    }

    simulateVoiceRecording(modal) {
        const startBtn = modal.querySelector('#startRecording');
        const stopBtn = modal.querySelector('#stopRecording');
        const waves = modal.querySelectorAll('.voice-wave');
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        
        // Animate voice waves
        waves.forEach(wave => {
            wave.style.animationPlayState = 'running';
        });

        // Simulate recording for 3 seconds
        setTimeout(() => {
            stopBtn.style.display = 'none';
            startBtn.style.display = 'inline-flex';
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Record Again';
            
            waves.forEach(wave => {
                wave.style.animationPlayState = 'paused';
            });

            // Show simulated transcript
            const transcript = modal.querySelector('.voice-transcript');
            const transcriptText = modal.querySelector('#transcriptText');
            transcriptText.textContent = "My cow has been coughing for 3 days, has nasal discharge, and seems lethargic. She's a Holstein, about 5 years old.";
            transcript.style.display = 'block';
            
            this.showNotification('Voice analysis complete! Transcript generated.', 'success');
        }, 3000);
    }

    // Enhanced scroll to form
    scrollToForm() {
        const form = document.getElementById('predictionForm');
        if (form) {
            form.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add highlight effect
            form.classList.add('highlight');
            setTimeout(() => {
                form.classList.remove('highlight');
            }, 2000);
        }
    }

    // Enhanced knowledge base
    showKnowledgeBase() {
        const knowledgeSection = document.getElementById('knowledgeBase');
        if (knowledgeSection) {
            if (knowledgeSection.style.display === 'none' || !knowledgeSection.style.display) {
                knowledgeSection.style.display = 'block';
                this.animateElement(knowledgeSection, 'slideInUp');
                knowledgeSection.scrollIntoView({ behavior: 'smooth' });
                this.showNotification('Knowledge base loaded', 'info', 2000);
            } else {
                this.animateElement(knowledgeSection, 'slideOutDown');
                setTimeout(() => {
                    knowledgeSection.style.display = 'none';
                }, 300);
            }
        }
    }
}

// Global functions for backward compatibility
function scrollToForm() {
    window.farmCareUI.scrollToForm();
}

function toggleSymptom(card, checkboxName) {
    window.farmCareUI.toggleSymptomCard(card);
}

function showVoicePrediction() {
    window.farmCareUI.showVoicePrediction();
}

function showKnowledgeBase() {
    window.farmCareUI.showKnowledgeBase();
}

function showEnhancedInfo(event) {
    event.preventDefault();
    window.farmCareUI.showNotification('🚀 Enhanced Features Available! Full farm management system with user accounts, analytics, and more!', 'info', 4000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.farmCareUI = new FarmCareProEnhanced();
    
    // Add welcome message
    setTimeout(() => {
        window.farmCareUI.showNotification('Welcome to FarmCare Pro! 🐾 Enhanced UI loaded successfully.', 'success', 3000);
    }, 1000);
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}