// Admin Panel JavaScript

class AdminApp {
    constructor() {
        this.projects = [];
        this.currentEditingProject = null;
        this.currentDeleteProject = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    async checkAuth() {
        const loginModal = document.getElementById('loginModal');
        const adminDashboard = document.getElementById('adminDashboard');
        
        try {
            // Try to access admin endpoint to check if authenticated
            const response = await fetch('/api/admin/projetos');
            
            if (response.ok) {
                // User is authenticated
                loginModal.style.display = 'none';
                adminDashboard.style.display = 'block';
                this.loadDashboard();
            } else {
                // User needs to login
                loginModal.classList.add('show');
                adminDashboard.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            loginModal.classList.add('show');
            adminDashboard.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Add project button
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => this.openProjectModal());
        }

        // Project form
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        }

        // Modal close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeProjectModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeProjectModal());
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => this.confirmDelete());

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const projectModal = document.getElementById('projectModal');
            const deleteModal = document.getElementById('deleteModal');
            
            if (e.target === projectModal) this.closeProjectModal();
            if (e.target === deleteModal) this.closeDeleteModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProjectModal();
                this.closeDeleteModal();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginError = document.getElementById('loginError');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Clear previous errors
        loginError.style.display = 'none';
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    password: formData.get('password')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Login successful
                document.getElementById('loginModal').classList.remove('show');
                document.getElementById('adminDashboard').style.display = 'block';
                this.loadDashboard();
                e.target.reset();
            } else {
                // Login failed
                loginError.textContent = result.error || 'Erro ao fazer login';
                loginError.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            loginError.textContent = 'Erro de conexão. Tente novamente.';
            loginError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    }

    async handleLogout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            
            // Redirect to home or reload page
            window.location.href = '/';
            
        } catch (error) {
            console.error('Erro no logout:', error);
            // Force reload anyway
            window.location.reload();
        }
    }

    async loadDashboard() {
        await this.loadProjects();
        this.updateStats();
    }

    async loadProjects() {
        const tableBody = document.getElementById('projectsTableBody');
        const loading = document.getElementById('projectsLoading');
        const noProjects = document.getElementById('noProjects');
        
        try {
            loading.style.display = 'block';
            noProjects.style.display = 'none';
            tableBody.innerHTML = '';
            
            const response = await fetch('/api/admin/projetos');
            if (!response.ok) throw new Error('Erro ao carregar projetos');
            
            this.projects = await response.json();
            this.renderProjectsTable();
            
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            this.showNotification('Erro ao carregar projetos', 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    renderProjectsTable() {
        const tableBody = document.getElementById('projectsTableBody');
        const noProjects = document.getElementById('noProjects');
        
        if (!this.projects || this.projects.length === 0) {
            tableBody.innerHTML = '';
            noProjects.style.display = 'block';
            return;
        }
        
        noProjects.style.display = 'none';
        
        const projectsHTML = this.projects.map(project => {
            const technologies = project.tecnologias ? 
                project.tecnologias.split(',').map(tech => tech.trim()).filter(tech => tech) : [];
            
            const techTagsHTML = technologies.slice(0, 3).map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('') + (technologies.length > 3 ? `<span class="tech-tag">+${technologies.length - 3}</span>` : '');

            const createdAt = new Date(project.created_at).toLocaleDateString('pt-BR');

            return `
                <tr>
                    <td>${project.id}</td>
                    <td class="project-title-cell">
                        <strong>${this.escapeHtml(project.titulo)}</strong>
                    </td>
                    <td>
                        <div class="tech-tags">
                            ${techTagsHTML}
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${project.ativo ? 'active' : 'inactive'}">
                            <i class="fas ${project.ativo ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            ${project.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        ${project.destaque ? 
                            '<span class="status-badge featured"><i class="fas fa-star"></i> Destaque</span>' : 
                            '<span class="text-muted">-</span>'
                        }
                    </td>
                    <td>${createdAt}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-edit" onclick="adminApp.editProject(${project.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-delete" onclick="adminApp.deleteProject(${project.id})" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tableBody.innerHTML = projectsHTML;
    }

    updateStats() {
        const totalProjects = this.projects.length;
        const activeProjects = this.projects.filter(p => p.ativo).length;
        const featuredProjects = this.projects.filter(p => p.destaque).length;
        
        document.getElementById('totalProjects').textContent = totalProjects;
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('featuredProjects').textContent = featuredProjects;
    }

    openProjectModal(project = null) {
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('projectForm');
        
        this.currentEditingProject = project;
        
        if (project) {
            // Editing existing project
            modalTitle.textContent = 'Editar Projeto';
            this.populateForm(project);
        } else {
            // Creating new project
            modalTitle.textContent = 'Adicionar Projeto';
            form.reset();
            document.getElementById('ativo').checked = true;
        }
        
        modal.classList.add('show');
        document.getElementById('titulo').focus();
    }

    closeProjectModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('show');
        this.currentEditingProject = null;
    }

    populateForm(project) {
        document.getElementById('projectId').value = project.id;
        document.getElementById('titulo').value = project.titulo;
        document.getElementById('descricao').value = project.descricao;
        document.getElementById('tecnologias').value = project.tecnologias || '';
        document.getElementById('github_url').value = project.github_url || '';
        document.getElementById('demo_url').value = project.demo_url || '';
        document.getElementById('imagem_url').value = project.imagem_url || '';
        document.getElementById('destaque').checked = project.destaque;
        document.getElementById('ativo').checked = project.ativo;
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const projectId = formData.get('id');
        
        const projectData = {
            titulo: formData.get('titulo'),
            descricao: formData.get('descricao'),
            tecnologias: formData.get('tecnologias'),
            github_url: formData.get('github_url'),
            demo_url: formData.get('demo_url'),
            imagem_url: formData.get('imagem_url'),
            destaque: formData.has('destaque'),
            ativo: formData.has('ativo')
        };
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        
        try {
            let response;
            
            if (projectId) {
                // Update existing project
                response = await fetch(`/api/admin/projetos/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectData)
                });
            } else {
                // Create new project
                response = await fetch('/api/admin/projetos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectData)
                });
            }
            
            const result = await response.json();
            
            if (response.ok) {
                this.showNotification(
                    projectId ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!',
                    'success'
                );
                this.closeProjectModal();
                await this.loadProjects();
            } else {
                this.showNotification(result.error || 'Erro ao salvar projeto', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
        }
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.openProjectModal(project);
        }
    }

    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.currentDeleteProject = project;
            document.getElementById('deleteProjectTitle').textContent = project.titulo;
            document.getElementById('deleteModal').classList.add('show');
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        this.currentDeleteProject = null;
    }

    async confirmDelete() {
        if (!this.currentDeleteProject) return;
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const originalText = confirmBtn.innerHTML;
        
        // Show loading state
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
        
        try {
            const response = await fetch(`/api/admin/projetos/${this.currentDeleteProject.id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Projeto excluído com sucesso!', 'success');
                this.closeDeleteModal();
                await this.loadProjects();
            } else {
                this.showNotification(result.error || 'Erro ao excluir projeto', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    }

    showNotification(message, type = 'info') {
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span id="notificationMessage"></span>
                </div>
            `;
            document.body.appendChild(notification);
        }
        
        // Update message and show
        document.getElementById('notificationMessage').textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

// Initialize admin app
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new AdminApp();
});

// Add error handling
window.addEventListener('error', (e) => {
    console.error('Erro não capturado:', e.error);
});

// Add styles for table responsiveness
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
    .project-title-cell {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .text-muted {
        color: #6c757d;
    }
    
    @media (max-width: 768px) {
        .projects-table th:nth-child(3),
        .projects-table td:nth-child(3),
        .projects-table th:nth-child(6),
        .projects-table td:nth-child(6) {
            display: none;
        }
        
        .action-buttons {
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .btn-sm {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
        }
    }
    
    @media (max-width: 480px) {
        .projects-table th:nth-child(2),
        .projects-table td:nth-child(2) {
            max-width: 120px;
        }
        
        .project-title-cell {
            max-width: 120px;
        }
    }
`;
document.head.appendChild(responsiveStyles);