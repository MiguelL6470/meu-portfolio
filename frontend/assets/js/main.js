// Main JavaScript for Portfolio Website

class PortfolioApp {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'todos';
        this.searchTerm = '';
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.observers = new Map();
        this.scrollPosition = 0;
        this.init();
    }

    init() {
        this.initializeTheme();
        this.setupEventListeners();
        this.setupIntersectionObservers();
        this.setupScrollAnimations();
        this.loadDynamicContent();
        this.loadProjects();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupContactForm();
        this.setupProjectSearch();
        this.setupAdvancedFeatures();
        this.setupPerformanceOptimizations();
    }

    setupEventListeners() {
        // Enhanced scroll handler with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveNavLink();
                this.updateScrollPosition();
                this.handleScrollAnimations();
            }, 10);
        }, { passive: true });
        
        // Mobile menu toggle with improved animation
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }

        // Enhanced nav link handling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Smooth scroll with offset calculation
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
                
                // Close mobile menu
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    left: -100%;
                    top: 70px;
                    flex-direction: column;
                    background-color: white;
                    width: 100%;
                    text-align: center;
                    transition: 0.3s;
                    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
                    z-index: 999;
                    padding: 2rem 0;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .hamburger.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .hamburger.active span:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                }
                
                .hamburger.active span:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    async loadProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        
        try {
            // Show loading state
            this.showProjectsLoading();
            
            const response = await fetch('/api/projetos');
            if (!response.ok) throw new Error('Erro ao carregar projetos');
            
            this.projects = await response.json();
            
            // Add slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.setupProjectFilters();
            this.applyFiltersAndSearch(); // Apply initial filters and search
            this.renderProjects();
            this.setupProjectAnimations();
            
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            this.renderProjectsError();
        }
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        
        if (!this.filteredProjects || this.filteredProjects.length === 0) {
            if (this.currentFilter === 'todos') {
                projectsGrid.innerHTML = `
                    <div class="empty-state fade-in-section">
                        <i class="fas fa-folder-open"></i>
                        <h3>Nenhum projeto encontrado</h3>
                        <p>Os projetos aparecerão aqui em breve!</p>
                    </div>
                `;
            } else {
                projectsGrid.innerHTML = `
                    <div class="empty-state fade-in-section">
                        <i class="fas fa-filter"></i>
                        <h3>Nenhum projeto encontrado</h3>
                        <p>Não há projetos para o filtro "${this.currentFilter}"</p>
                        <button class="btn btn-primary" onclick="portfolioApp.filterProjects('todos')">
                            <i class="fas fa-eye"></i>
                            Ver todos os projetos
                        </button>
                    </div>
                `;
            }
            return;
        }

        const projectsHTML = this.filteredProjects.map((project, index) => {
            const technologies = project.tecnologias ? 
                project.tecnologias.split(',').map(tech => tech.trim()).filter(tech => tech) : [];
            
            const techTagsHTML = technologies.map(tech => 
                `<span class="project-tech-tag enhanced-hover">${tech}</span>`
            ).join('');

            const linksHTML = this.generateProjectLinks(project);

            return `
                <div class="project-card enhanced-hover fade-in-section gpu-accelerated" 
                     data-technologies="${technologies.join(',').toLowerCase()}" 
                     data-category="${project.categoria || 'geral'}" 
                     data-index="${index}"
                     style="animation-delay: ${index * 0.1}s">
                    <div class="project-image">
                        ${this.isValidImageUrl(project.imagem_url) ? 
                            `<img src="${project.imagem_url}" alt="${project.titulo}" loading="lazy" 
                                  onerror="this.parentElement.innerHTML='<div class=\\'project-placeholder\\'><i class=\\'fas fa-code\\'></i><span>Sem Imagem</span></div>'"
                                  onload="this.classList.add('loaded')">` :
                            '<div class="project-placeholder"><i class="fas fa-code"></i><span>Projeto</span></div>'
                        }
                        ${project.destaque ? '<div class="project-featured"><i class="fas fa-star"></i> Destaque</div>' : ''}
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${this.escapeHtml(project.titulo)}</h3>
                        <p class="project-description">${this.escapeHtml(project.descricao)}</p>
                        ${technologies.length > 0 ? `
                            <div class="project-technologies">
                                <div class="project-tech-tags">
                                    ${techTagsHTML}
                                </div>
                            </div>
                        ` : ''}
                        ${linksHTML ? `<div class="project-links">${linksHTML}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        projectsGrid.innerHTML = projectsHTML;
        
        // Ajustar layout baseado no número de projetos
        this.adjustProjectsLayout(projectsGrid, this.filteredProjects.length);
        
        // Re-setup intersection observers for new elements
        setTimeout(() => {
            this.setupIntersectionObservers();
        }, 100);
    }
    
    adjustProjectsLayout(gridElement, projectCount) {
        // Remove todas as classes de layout
        gridElement.classList.remove('single-project', 'double-project', 'triple-project');
        
        // Adiciona classe baseada no número de projetos
        if (projectCount === 1) {
            gridElement.classList.add('single-project');
        } else if (projectCount === 2) {
            gridElement.classList.add('double-project');
        } else if (projectCount === 3) {
            gridElement.classList.add('triple-project');
        }
    }

    generateProjectLinks(project) {
        const links = [];
        
        if (project.github_url) {
            links.push(`
                <a href="${project.github_url}" target="_blank" rel="noopener noreferrer" class="project-link github">
                    <i class="fab fa-github"></i>
                    Código
                </a>
            `);
        }
        
        if (project.demo_url) {
            links.push(`
                <a href="${project.demo_url}" target="_blank" rel="noopener noreferrer" class="project-link demo">
                    <i class="fas fa-external-link-alt"></i>
                    Demo
                </a>
            `);
        }
        
        return links.join('');
    }

    renderProjectsError() {
        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar projetos</h3>
                <p>Tente recarregar a página</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i>
                    Recarregar
                </button>
            </div>
        `;
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }
    }

    async loadDynamicContent() {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) {
                console.warn('Conteúdo dinâmico não disponível, usando conteúdo estático');
                return;
            }
            
            const content = await response.json();
            this.updatePageContent(content);
            
        } catch (error) {
            console.warn('Conteúdo dinâmico não disponível, usando conteúdo estático:', error.message);
        }
    }

    updatePageContent(content) {
        // Atualizar Hero Section
        if (content.hero) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const primaryBtn = document.querySelector('.hero-buttons .btn-primary');
            const secondaryBtn = document.querySelector('.hero-buttons .btn-secondary');
            
            if (heroTitle && content.hero.title) {
                heroTitle.innerHTML = content.hero.title.value.replace('Desenvolvedor', '<span class="highlight">Desenvolvedor</span>');
            }
            if (heroSubtitle && content.hero.subtitle) {
                heroSubtitle.textContent = content.hero.subtitle.value;
            }
            if (primaryBtn && content.hero.cta_primary) {
                primaryBtn.textContent = content.hero.cta_primary.value;
            }
            if (secondaryBtn && content.hero.cta_secondary) {
                secondaryBtn.textContent = content.hero.cta_secondary.value;
            }
        }

        // Atualizar About Section
        if (content.about) {
            const aboutTitle = document.querySelector('#sobre .section-title');
            const aboutParagraphs = document.querySelectorAll('.about-text p');
            const skillTags = document.querySelector('.skill-tags');
            
            if (aboutTitle && content.about.title) {
                aboutTitle.textContent = content.about.title.value;
            }
            
            if (content.about.paragraph1 && aboutParagraphs[0]) {
                aboutParagraphs[0].innerHTML = content.about.paragraph1.value;
            }
            
            if (content.about.paragraph2 && aboutParagraphs[1]) {
                aboutParagraphs[1].innerHTML = content.about.paragraph2.value;
            }
            
            if (content.about.skills && skillTags) {
                const skills = content.about.skills.value.split(',').map(s => s.trim());
                skillTags.innerHTML = skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('');
            }
        }

        // Atualizar Contact Section
        if (content.contact) {
            const contactTitle = document.querySelector('#contato .section-title');
            const contactSubtitle = document.querySelector('.contact-info h3');
            const contactDescription = document.querySelector('.contact-info p');
            
            if (contactTitle && content.contact.title) {
                contactTitle.textContent = content.contact.title.value;
            }
            if (contactSubtitle && content.contact.subtitle) {
                contactSubtitle.textContent = content.contact.subtitle.value;
            }
            if (contactDescription && content.contact.description) {
                contactDescription.textContent = content.contact.description.value;
            }
        }

        // Atualizar Footer
        if (content.footer && content.footer.copyright) {
            const footerText = document.querySelector('.footer-content p');
            if (footerText) {
                footerText.innerHTML = content.footer.copyright.value.replace('❤️', '<i class="fas fa-heart"></i>');
            }
        }
    }

    async handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('nome'),
                    email: formData.get('email'),
                    subject: formData.get('assunto'),
                    message: formData.get('mensagem')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                this.showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
                
                // Reset form
                e.target.reset();
            } else {
                this.showNotification(result.error || 'Erro ao enviar mensagem. Tente novamente.', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span id="notificationMessage"></span>
                    <button class="notification-close">&times;</button>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Add close functionality
            notification.querySelector('.notification-close').addEventListener('click', () => {
                this.hideNotification();
            });
        }
        
        // Update message and show
        document.getElementById('notificationMessage').textContent = message;
        notification.className = `notification ${type}`;
        
        // Add notification styles if not present
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    max-width: 400px;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }
                
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .notification-content {
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    border-left: 4px solid #007bff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }
                
                .notification.success .notification-content {
                    border-left-color: #28a745;
                }
                
                .notification.error .notification-content {
                    border-left-color: #dc3545;
                }
                
                .notification.warning .notification-content {
                    border-left-color: #ffc107;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    color: #6c757d;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification-close:hover {
                    color: #2c3e50;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideNotification(), 5000);
    }

    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    // Dark Mode Functionality
    initializeTheme() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        this.createThemeToggle();
    }

    createThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle enhanced-hover';
        themeToggle.setAttribute('aria-label', 'Alternar modo escuro');
        themeToggle.innerHTML = `
            <i class="fas fa-sun sun-icon"></i>
            <i class="fas fa-moon moon-icon"></i>
        `;
        
        themeToggle.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(themeToggle);
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode.toString());
        
        // Add smooth transition class
        document.documentElement.classList.add('theme-transitioning');
        
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
        
        // Update theme toggle icon with animation
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.classList.add('theme-switching');
            setTimeout(() => {
                themeToggle.classList.remove('theme-switching');
            }, 300);
        }
        
        // Add visual feedback
        this.showNotification(
            this.darkMode ? '🌙 Modo escuro ativado!' : '☀️ Modo claro ativado!', 
            'success'
        );
    }

    // Project Filtering System
    setupProjectFilters() {
        const projectsSection = document.getElementById('projetos');
        const projectsGrid = document.getElementById('projectsGrid');
        const container = projectsSection?.querySelector('.container');
        
        if (!projectsSection || !projectsGrid || !container) return;
        
        // Remove existing filters if they exist
        const existingFilters = container.querySelector('.project-filters');
        if (existingFilters) {
            existingFilters.remove();
        }
        
        // Get unique technologies
        const allTechnologies = new Set();
        this.projects.forEach(project => {
            if (project.tecnologias) {
                project.tecnologias.split(',').forEach(tech => {
                    allTechnologies.add(tech.trim().toLowerCase());
                });
            }
        });
        
        // Create filter buttons
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'project-filters';
        
        const commonFilters = ['todos', 'javascript', 'react', 'node.js', 'python', 'html', 'css'];
        const filters = ['todos', ...new Set([...commonFilters.slice(1), ...Array.from(allTechnologies)])];
        
        filtersContainer.innerHTML = filters.slice(0, 8).map(filter => `
            <button class="filter-btn enhanced-hover ${filter === 'todos' ? 'active' : ''}" 
                    data-filter="${filter}" 
                    onclick="portfolioApp.filterProjects('${filter}')">
                ${filter === 'todos' ? 'Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
        `).join('');
        
        container.insertBefore(filtersContainer, projectsGrid);
    }

    filterProjects(filterType) {
        this.currentFilter = filterType;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });
        
        // Apply filters and search
        this.applyFiltersAndSearch();
    }
    
    applyFiltersAndSearch() {
        let filtered = [...this.projects];
        
        // Apply technology filter
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(project => {
                if (!project.tecnologias) return false;
                const technologies = project.tecnologias.toLowerCase();
                return technologies.includes(this.currentFilter.toLowerCase());
            });
        }
        
        // Apply search term
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(project => {
                const title = (project.titulo || '').toLowerCase();
                return title.includes(searchLower);
            });
        }
        
        this.filteredProjects = filtered;
        
        // Animate out current projects
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => card.classList.add('filtered-out'));
        
        // Render new projects after animation
        setTimeout(() => {
            this.renderProjects();
        }, 300);
    }
    
    setupProjectSearch() {
        const searchInput = document.getElementById('projectSearch');
        const searchClearBtn = document.getElementById('searchClearBtn');
        
        if (!searchInput) return;
        
        // Busca em tempo real
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            
            // Mostrar/esconder botão de limpar
            if (this.searchTerm.trim()) {
                searchClearBtn.style.display = 'flex';
            } else {
                searchClearBtn.style.display = 'none';
            }
            
            // Aplicar filtros e busca
            this.applyFiltersAndSearch();
        });
        
        // Botão de limpar busca
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                searchClearBtn.style.display = 'none';
                this.applyFiltersAndSearch();
            });
        }
        
        // Limpar busca ao pressionar Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.searchTerm = '';
                searchClearBtn.style.display = 'none';
                this.applyFiltersAndSearch();
            }
        });
    }

    // Advanced Animation System
    setupIntersectionObservers() {
        // Clear existing observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Section fade-in observer
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });
        
        // Observe all fade-in sections
        document.querySelectorAll('.fade-in-section').forEach(section => {
            fadeInObserver.observe(section);
        });
        
        this.observers.set('fadeIn', fadeInObserver);
        
        // Skill tags animation observer
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillTags = entry.target.querySelectorAll('.skill-tag');
                    skillTags.forEach((tag, index) => {
                        setTimeout(() => {
                            tag.style.opacity = '1';
                            tag.style.transform = 'translateY(0) scale(1)';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.3 });
        
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            skillObserver.observe(skillsSection);
        }
        
        this.observers.set('skills', skillObserver);
    }

    setupScrollAnimations() {
        // Create scroll to top button
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top enhanced-hover';
        scrollTopBtn.setAttribute('aria-label', 'Voltar ao topo');
        scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        document.body.appendChild(scrollTopBtn);
    }

    updateScrollPosition() {
        this.scrollPosition = window.scrollY;
        
        // Update scroll to top button visibility
        const scrollTopBtn = document.querySelector('.scroll-top');
        if (scrollTopBtn) {
            if (this.scrollPosition > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Update navbar style based on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (this.scrollPosition > 100) {
                navbar.style.boxShadow = '0 4px 30px var(--shadow-medium)';
            } else {
                navbar.style.boxShadow = '0 2px 20px var(--shadow-light)';
            }
        }
    }

    handleScrollAnimations() {
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero && this.scrollPosition < window.innerHeight) {
            const parallaxBg = hero.querySelector('::before');
            if (parallaxBg) {
                const speed = this.scrollPosition * 0.5;
                hero.style.transform = `translateY(${speed}px)`;
            }
        }
    }

    // Advanced Features Setup
    setupAdvancedFeatures() {
        this.setupKeyboardShortcuts();
        this.setupToastSystem();
        this.addPreloadingOptimizations();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D = Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Ctrl/Cmd + K = Focus search/filter (if exists)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const firstFilterBtn = document.querySelector('.filter-btn');
                firstFilterBtn?.focus();
            }
        });
    }

    setupToastSystem() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;padding:0 0 0 1rem;">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    setupProjectAnimations() {
        // Add click animations to project cards
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    card.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 150);
                }
            });
        });
    }

    setupPerformanceOptimizations() {
        // Add GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.project-card, .skill-tag, .btn, .profile-circle');
        animatedElements.forEach(el => {
            el.classList.add('gpu-accelerated');
        });
        
        // Preload critical images
        this.preloadImages();
    }

    isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Verificar se é uma URL válida
        try {
            new URL(url);
        } catch {
            return false;
        }
        
        // Verificar extensões de imagem comuns
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
        return imageExtensions.test(url) || url.includes('/uploads/');
    }

    preloadImages() {
        const imageUrls = this.projects
            .filter(project => this.isValidImageUrl(project.imagem_url))
            .map(project => project.imagem_url);
            
        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => console.log(`Imagem carregada: ${url.split('/').pop()}`);
            img.onerror = () => console.warn(`Falha ao carregar imagem: ${url}`);
            img.src = url;
        });
        
        console.log(`Pré-carregando ${imageUrls.length} imagens`);
    }

    addPreloadingOptimizations() {
        // Add resource hints for better performance
        const preconnects = [
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com'
        ];
        
        preconnects.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    showProjectsLoading() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="loading fade-in-section">
                    <div class="loading-spinner"></div>
                    <p>Carregando projetos...</p>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Add error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Erro não capturado:', e.error);
});

// Add loading animation styles
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .error-state {
        text-align: center;
        padding: 3rem;
        color: #5a6c7d;
    }
    
    .error-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #dc3545;
    }
    
    .error-state h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }
    
    .error-state p {
        margin-bottom: 1.5rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #5a6c7d;
        grid-column: 1 / -1;
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ced4da;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }
`;
document.head.appendChild(loadingStyles);