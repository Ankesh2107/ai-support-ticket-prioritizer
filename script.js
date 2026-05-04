document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    const processBtn = document.getElementById('processBtn');
    const btnText = processBtn.querySelector('.btn-text');
    const btnLoading = processBtn.querySelector('.btn-loading');
    const resultsSection = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const resetBtn = document.getElementById('resetBtn');
    const particlesContainer = document.getElementById('particles');

    // Cloudflare Worker URL
    const WORKER_URL = 'https://ai-support-ticket-prioritizer.ankeshrai2003.workers.dev';

    // Create floating particles
    createParticles();
    
    function createParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 20 + 's';
        
        // Random animation duration
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        particlesContainer.appendChild(particle);
    }

    // Process button click handler
    processBtn.addEventListener('click', processTicket);
    
    // Reset button click handler
    resetBtn.addEventListener('click', resetForm);
    
    // Allow Enter key to submit (with Shift+Enter for new line)
    messageTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processTicket();
        }
    });

    async function processTicket() {
        const message = messageTextarea.value.trim();
        
        // Validation
        if (!message) {
            showError('Please enter a support message.');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideError();
        hideResults();

        try {
            // Call Cloudflare Worker
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response not ok:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            let aiReply = '';
            let category = 'GENERAL';
            let priority = 'MEDIUM';
            
            // Handle the response format from your worker
            if (data.success && data.data) {
                // Your worker's successful response format
                category = data.data.category;
                priority = data.data.priority;
                aiReply = data.data.reply;
            } 
            // Handle raw Groq format (fallback)
            else if (data.choices && data.choices[0] && data.choices[0].message) {
                aiReply = data.choices[0].message.content;
                
                // Parse priority from AI response
                if (aiReply.toLowerCase().includes('priority: high') || aiReply.toLowerCase().includes('high priority')) {
                    priority = 'HIGH';
                } else if (aiReply.toLowerCase().includes('priority: low') || aiReply.toLowerCase().includes('low priority')) {
                    priority = 'LOW';
                } else {
                    priority = 'MEDIUM';
                }
                
                // Parse category from AI response
                if (aiReply.toLowerCase().includes('support') || aiReply.toLowerCase().includes('technical') || 
                    aiReply.toLowerCase().includes('login') || aiReply.toLowerCase().includes('error')) {
                    category = 'SUPPORT';
                } else if (aiReply.toLowerCase().includes('sales') || aiReply.toLowerCase().includes('billing') || 
                           aiReply.toLowerCase().includes('payment')) {
                    category = 'SALES';
                }
            } 
            // Handle direct format (another fallback)
            else if (data.category && data.reply) {
                category = data.category;
                priority = data.priority || 'MEDIUM';
                aiReply = data.reply;
            } 
            else if (data.error) {
                throw new Error(data.error);
            } 
            else {
                console.error('Unexpected response:', data);
                throw new Error('Unexpected response format');
            }

            displayResults({ category, priority, aiReply });

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while processing the ticket. Please try again.');
        } finally {
            setLoadingState(false);
        }
    }

    function displayResults(data) {
        const { category, priority, aiReply } = data;
        
        // Add celebration effect
        createCelebrationEffect();
        
        // Animate badge updates
        setTimeout(() => {
            // Update category badge with animation
            const categoryBadge = document.getElementById('categoryBadge');
            categoryBadge.style.transform = 'scale(0)';
            categoryBadge.textContent = category;
            categoryBadge.className = `badge category-badge ${category.toLowerCase()}`;
            
            setTimeout(() => {
                categoryBadge.style.transform = 'scale(1)';
            }, 100);
            
            // Update priority badge with animation
            const priorityBadge = document.getElementById('priorityBadge');
            priorityBadge.style.transform = 'scale(0)';
            priorityBadge.textContent = priority;
            priorityBadge.className = `badge priority-badge ${priority.toLowerCase()}`;
            
            setTimeout(() => {
                priorityBadge.style.transform = 'scale(1)';
            }, 200);
            
            // Update AI reply with typewriter effect
            const replyBox = document.getElementById('aiReply');
            typewriterEffect(replyBox, aiReply);
        }, 300);
        
        // Show results
        resultsSection.style.display = 'block';
        
        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }
    
    function createCelebrationEffect() {
        // Create burst of particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const celebrationParticle = document.createElement('div');
                celebrationParticle.style.position = 'fixed';
                celebrationParticle.style.width = '8px';
                celebrationParticle.style.height = '8px';
                celebrationParticle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
                celebrationParticle.style.borderRadius = '50%';
                celebrationParticle.style.pointerEvents = 'none';
                celebrationParticle.style.zIndex = '9999';
                
                const rect = processBtn.getBoundingClientRect();
                celebrationParticle.style.left = rect.left + rect.width / 2 + 'px';
                celebrationParticle.style.top = rect.top + rect.height / 2 + 'px';
                
                document.body.appendChild(celebrationParticle);
                
                // Animate particle burst
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 200 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let opacity = 1;
                let x = 0;
                let y = 0;
                
                const animateParticle = () => {
                    x += vx * 0.02;
                    y += vy * 0.02 + 2; // gravity
                    opacity -= 0.02;
                    
                    celebrationParticle.style.transform = `translate(${x}px, ${y}px)`;
                    celebrationParticle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        celebrationParticle.remove();
                    }
                };
                
                requestAnimationFrame(animateParticle);
            }, i * 50);
        }
    }
    
    function typewriterEffect(element, text, speed = 30) {
        element.textContent = '';
        let i = 0;
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }

    function setLoadingState(loading) {
        processBtn.disabled = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorDiv.style.display = 'none';
    }

    function hideResults() {
        resultsSection.style.display = 'none';
    }

    function resetForm() {
        messageTextarea.value = '';
        hideResults();
        hideError();
        messageTextarea.focus();
    }

    // Auto-resize textarea
    messageTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Focus on textarea on load
    messageTextarea.focus();
});
