// Lista de tecnologias comuns para seleção rápida
const TECHNOLOGY_OPTIONS = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'NestJS',
    'Vite',
    'Tailwind CSS',
    'Sass',
    'Styled Components',
    'Redux Toolkit',
    'React Query',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Prisma',
    'Docker'
];

// Ícones para representar cada stack
const TECHNOLOGY_ICONS = {
    'HTML': 'fa-brands fa-html5',
    'CSS': 'fa-brands fa-css3-alt',
    'JavaScript': 'fa-brands fa-square-js',
    'TypeScript': 'fa-solid fa-code',
    'React': 'fa-brands fa-react',
    'Next.js': 'fa-solid fa-circle-half-stroke',
    'Node.js': 'fa-brands fa-node-js',
    'Express': 'fa-solid fa-road',
    'NestJS': 'fa-solid fa-feather',
    'Vite': 'fa-solid fa-bolt-lightning',
    'Tailwind CSS': 'fa-solid fa-wind',
    'Sass': 'fa-solid fa-swatchbook',
    'Styled Components': 'fa-solid fa-gem',
    'Redux Toolkit': 'fa-solid fa-diagram-project',
    'React Query': 'fa-solid fa-magnifying-glass-chart',
    'PostgreSQL': 'fa-solid fa-database',
    'MySQL': 'fa-solid fa-server',
    'MongoDB': 'fa-solid fa-leaf',
    'Prisma': 'fa-solid fa-diamond',
    'Docker': 'fa-brands fa-docker'
};

// Super Admin Panel - Advanced JavaScript Implementation
class SuperAdminApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.projects = [];
        this.uploads = [];
        this.messages = [];
        this.settings = {};
        this.content = {};
        this.analytics = {};
        this.charts = {};
        this.onlineVisitors = 0;
        this.realTimeUpdates = null;
        this.searchFilters = {};
        this.selectedItems = new Set();
        
        // Advanced state management
        this.state = {
            loading: false,
            sidebar: { collapsed: false },
            modals: { active: null },
            notifications: [],
            cache: new Map(),
            lastUpdate: null
        };
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.setupEventListeners();
        this.restoreSidebarState();
        await this.loadInitialData();
        await this.initializeCharts();
        this.setupRealTimeUpdates();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
        this.hideLoadingScreen();
    }

    // ===== EVENT LISTENERS =====
    
    async setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
                this.trackUserAction('navigation', { section });
            });
        });

        // Universal data-action handler
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            e.preventDefault();
            e.stopPropagation();

            const target = e.target.closest('[data-action]');
            
            switch (action) {
                case 'refresh-chart':
                    const chartType = target.dataset.chart;
                    this.refreshChart(chartType);
                    break;
                case 'refresh-activity':
                    this.refreshActivity();
                    break;
                case 'switch-section':
                    const section = target.dataset.section;
                    this.switchSection(section);
                    break;
                case 'export-projects':
                    this.exportProjects();
                    break;
                case 'preview-site':
                    this.previewSite();
                    break;
                case 'save-all-content':
                    this.saveAllContent();
                    break;
                case 'bulk-delete':
                    this.bulkDelete();
                    break;
                case 'trigger-file-input':
                    document.getElementById('fileInput').click();
                    break;
                case 'mark-all-read':
                    this.markAllRead();
                    break;
                case 'delete-selected':
                    this.deleteSelected();
                    break;
                case 'export-analytics':
                    this.exportAnalytics();
                    break;
                case 'refresh-analytics':
                    this.refreshAnalytics();
                    break;
                case 'reset-settings':
                    this.resetSettings();
                    break;
                case 'save-settings':
                    this.saveSettings();
                    break;
                case 'close-modal':
                    const modalId = target.dataset.modal;
                    this.closeModal(modalId);
                    break;
                case 'hide-toast':
                    this.hideToast();
                    break;
                case 'edit-project':
                    const editId = target.dataset.id;
                    this.editProject(editId);
                    break;
                case 'duplicate-project':
                    const duplicateId = target.dataset.id;
                    this.duplicateProject(duplicateId);
                    break;
                case 'delete-project':
                    const deleteId = target.dataset.id;
                    this.deleteProject(deleteId);
                    break;
                case 'toggle-project-status':
                    const toggleId = target.dataset.id;
                    const currentStatus = target.dataset.currentStatus === 'true';
                    this.toggleProjectStatus(toggleId, !currentStatus);
                    break;
                case 'select-item':
                    const itemId = target.dataset.id;
                    const itemType = target.dataset.type;
                    this.handleItemSelection(target, `${itemType}-${itemId}`);
                    break;
                case 'open-project-modal':
                    this.openProjectModal();
                    break;
                case 'view-message':
                    const messageId = target.dataset.id;
                    this.viewMessage(messageId);
                    break;
                case 'mark-message-read':
                    const readMessageId = target.dataset.id;
                    e.stopPropagation();
                    this.markMessageRead(readMessageId);
                    break;
                case 'delete-message':
                    const deleteMessageId = target.dataset.id;
                    e.stopPropagation();
                    this.deleteMessage(deleteMessageId);
                    break;
                case 'select-media-item':
                    const mediaId = target.dataset.id;
                    this.selectMediaItem(mediaId);
                    break;
                case 'view-media':
                    const viewMediaId = target.dataset.id;
                    this.viewMedia(viewMediaId);
                    break;
                case 'copy-media-url':
                    const mediaUrl = target.dataset.url;
                    this.copyMediaUrl(mediaUrl);
                    break;
                case 'delete-media':
                    const deleteMediaId = target.dataset.id;
                    this.deleteMedia(deleteMediaId);
                    break;
                default:
                    console.warn(`Ação não implementada: ${action}`);
            }
        });

        // View Site button
        const viewSiteBtn = document.getElementById('viewSiteBtn');
        if (viewSiteBtn) {
            viewSiteBtn.addEventListener('click', () => {
                window.open('/', '_blank');
            });
        }

        // Add Project button
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }

        // Sidebar toggle with animation
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Advanced logout with confirmation
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                if (this.hasUnsavedChanges()) {
                    this.showConfirmDialog(
                        'Você tem alterações não salvas. Deseja realmente sair?',
                        () => this.logout(),
                        'Sair mesmo assim'
                    );
                } else {
                    this.logout();
                }
            });
        }

        // Content editor sections
        document.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchContentSection(section);
            });
        });

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchSettingsTab(tab);
            });
        });
        
        // Monitor changes in settings fields
        const settingsFields = [
            'site-title', 'main-email', 'site-description', 'maintenance-mode', 
            'analytics-enabled', 'primary-color', 'secondary-color', 
            'meta-description', 'github-url', 'linkedin-url'
        ];
        
        settingsFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                ['input', 'change', 'keyup'].forEach(eventType => {
                    element.addEventListener(eventType, () => {
                        // Debounce para evitar muitas chamadas
                        clearTimeout(this.highlightTimeout);
                        this.highlightTimeout = setTimeout(() => {
                            this.highlightChangedFields();
                        }, 300);
                    });
                });
            }
        });

        // Project form with real-time validation
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            this.populateTechnologySelect();
            projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
            
            // Real-time validation
            const inputs = projectForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => this.validateField(e.target));
                input.addEventListener('blur', (e) => this.validateField(e.target));
            });

            const addCustomTechBtn = document.getElementById('addCustomTechBtn');
            if (addCustomTechBtn) {
                addCustomTechBtn.addEventListener('click', () => {
                    const value = prompt('Adicionar nova tecnologia:');
                    if (value) this.addCustomTechnology(value);
                });
            }
        }

        // Advanced file upload
        this.setupAdvancedFileUpload();

        // Search and filters
        this.setupSearchAndFilters();

        // Bulk actions
        this.setupBulkActions();

        // Auto-save functionality
        this.setupAutoSave();

        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'Você tem alterações não salvas.';
            }
        });

        window.addEventListener('online', () => {
            this.showToast('Conexão restabelecida', 'success');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.showToast('Conexão perdida. Trabalhando offline.', 'warning');
        });

        // Resize handler for responsive charts (usar throttle para melhor performance)
        window.addEventListener('resize', throttle(() => {
            this.resizeCharts();
        }, 100));
    }

    restoreSidebarState() {
        try {
            const stored = localStorage.getItem('adminSidebarCollapsed');
            const shouldCollapse = stored === '1';
            this.state.sidebar.collapsed = shouldCollapse;
            
            const sidebar = document.getElementById('sidebar');
            if (sidebar && shouldCollapse) {
                sidebar.classList.add('collapsed');
            }
        } catch (error) {
            console.warn('Não foi possível restaurar o estado da sidebar:', error);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.state.sidebar.collapsed = !this.state.sidebar.collapsed;
        sidebar.classList.toggle('collapsed', this.state.sidebar.collapsed);

        try {
            localStorage.setItem('adminSidebarCollapsed', this.state.sidebar.collapsed ? '1' : '0');
        } catch (error) {
            console.warn('Não foi possível salvar o estado da sidebar:', error);
        }

        this.resizeCharts();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentSection();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.currentSection === 'projects') {
                            this.openProjectModal();
                        }
                        break;
                    case 'f':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleSidebar();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });
    }

    setupTooltips() {
        // Initialize tooltips for buttons and icons
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('title'));
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    setupAdvancedFileUpload() {
        // Advanced drag & drop with preview
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;

        // Drag & drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        uploadZone.addEventListener('dragenter', () => {
            uploadZone.classList.add('dragover');
            this.showUploadHint();
        });

        uploadZone.addEventListener('dragleave', (e) => {
            if (!uploadZone.contains(e.relatedTarget)) {
                uploadZone.classList.remove('dragover');
                this.hideUploadHint();
            }
        });

        uploadZone.addEventListener('drop', (e) => {
            uploadZone.classList.remove('dragover');
            this.hideUploadHint();
            const files = e.dataTransfer.files;
            this.handleMultipleFileUpload(files);
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleMultipleFileUpload(e.target.files);
                e.target.value = '';
            });
        }

        // Project image upload with crop functionality
        this.setupProjectImageUpload();
    }

    setupProjectImageUpload() {
        const imageUploadArea = document.getElementById('imageUploadArea');
        if (imageUploadArea) {
            imageUploadArea.addEventListener('click', () => {
                document.getElementById('project-image').click();
            });

            imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadArea.classList.add('drag-active');
            });

            imageUploadArea.addEventListener('dragleave', () => {
                imageUploadArea.classList.remove('drag-active');
            });

            imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadArea.classList.remove('drag-active');
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.handleProjectImageUpload({ target: { files: [files[0]] } });
                }
            });
        }

        const projectImageInput = document.getElementById('project-image');
        if (projectImageInput) {
            projectImageInput.addEventListener('change', (e) => this.handleProjectImageUpload(e));
        }
    }

    setupSearchAndFilters() {
        // Projects search
        const projectsSearch = document.getElementById('projectsSearch');
        if (projectsSearch) {
            projectsSearch.addEventListener('input', debounce((e) => {
                this.filterProjects(e.target.value, this.searchFilters.projects?.status);
            }, 150));
        }

        const projectsFilter = document.getElementById('projectsFilter');
        if (projectsFilter) {
            projectsFilter.addEventListener('change', (e) => {
                this.filterProjects(this.searchFilters.projects?.search || '', e.target.value);
            });
        }

        // Media search
        const mediaSearch = document.getElementById('mediaSearch');
        if (mediaSearch) {
            mediaSearch.addEventListener('input', debounce((e) => {
                this.filterMedia(e.target.value, this.searchFilters.media?.type);
            }, 150));
        }

        const mediaTypeFilter = document.getElementById('mediaTypeFilter');
        if (mediaTypeFilter) {
            mediaTypeFilter.addEventListener('change', (e) => {
                this.filterMedia(this.searchFilters.media?.search || '', e.target.value);
            });
        }

        // Messages search
        const messagesSearch = document.getElementById('messagesSearch');
        if (messagesSearch) {
            messagesSearch.addEventListener('input', debounce((e) => {
                this.filterMessages(e.target.value, this.searchFilters.messages?.status);
            }, 150));
        }

        const messagesStatusFilter = document.getElementById('messagesStatusFilter');
        if (messagesStatusFilter) {
            messagesStatusFilter.addEventListener('change', (e) => {
                this.filterMessages(this.searchFilters.messages?.search || '', e.target.value);
            });
        }
    }

    setupBulkActions() {
        // Select all functionality
        const selectAllProjects = document.getElementById('selectAllProjects');
        if (selectAllProjects) {
            selectAllProjects.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('#projectsTableBody input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    const id = checkbox.dataset.id;
                    if (e.target.checked) {
                        this.selectedItems.add(`project-${id}`);
                    } else {
                        this.selectedItems.delete(`project-${id}`);
                    }
                });
                this.updateBulkActions();
            });
        }
    }

    setupAutoSave() {
        // Auto-save content changes every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'content' && this.hasContentChanges()) {
                this.autoSaveContent();
            }
        }, 30000);
    }

    // ===== DATA LOADING =====

    async loadInitialData() {
        try {
            const startTime = performance.now();
            
            const promises = [
                this.loadProjects(),
                this.loadUploads(),
                this.loadMessages(),
                this.loadSettings(),
                this.loadContent(),
                this.loadAnalytics()
            ];

            await Promise.all(promises);
            
            const loadTime = performance.now() - startTime;
            console.log(`Data loaded in ${loadTime.toFixed(2)}ms`);
            
            this.updateDashboard();
            this.state.lastUpdate = new Date();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar dados iniciais. Tentando novamente...', 'error');
            setTimeout(() => this.loadInitialData(), 3000);
        }
    }

    async loadProjects(useCache = false) {
        const cacheKey = 'projects';
        if (useCache && this.state.cache.has(cacheKey)) {
            this.projects = this.state.cache.get(cacheKey);
            this.updateProjectsTable();
            return;
        }

        try {
            const response = await this.fetchWithTimeout('/api/admin/projetos', 10000);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validar dados recebidos
            if (!Array.isArray(data)) {
                console.warn('Dados de projetos inválidos, usando array vazio');
                this.projects = [];
            } else {
                this.projects = data.map(project => ({
                    id: project.id || 0,
                    titulo: project.titulo || 'Sem título',
                    descricao: project.descricao || 'Sem descrição',
                    tecnologias: project.tecnologias || '',
                    github_url: project.github_url || '',
                    demo_url: project.demo_url || '',
                    imagem_url: project.imagem_url || '',
                    destaque: Boolean(project.destaque),
                    ativo: Boolean(project.ativo),
                    created_at: project.created_at || new Date().toISOString(),
                    updated_at: project.updated_at || new Date().toISOString()
                }));
            }
            
            this.state.cache.set(cacheKey, this.projects);
            this.updateProjectsTable();
            this.updateProjectsBadge();
            
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            this.projects = [];
            this.updateProjectsTable();
            this.updateProjectsBadge();
            
            if (!useCache) {
                this.showToast(`Erro ao carregar projetos: ${error.message}`, 'error');
            }
        }
    }

    async loadUploads(page = 1, limit = 20) {
        try {
            const response = await this.fetchWithTimeout(`/api/admin/uploads?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validar estrutura dos dados
            if (data && typeof data === 'object') {
                this.uploads = Array.isArray(data.uploads) ? data.uploads.map(upload => ({
                    id: upload.id || 0,
                    original_name: upload.original_name || 'Arquivo sem nome',
                    file_path: upload.file_path || '',
                    mime_type: upload.mime_type || 'unknown',
                    file_size: Number(upload.file_size) || 0,
                    alt_text: upload.alt_text || '',
                    created_at: upload.created_at || new Date().toISOString()
                })) : [];
                
                this.uploadsPagination = data.pagination || { page: 1, pages: 1, total: 0 };
            } else {
                console.warn('Dados de uploads inválidos, usando valores padrão');
                this.uploads = [];
                this.uploadsPagination = { page: 1, pages: 1, total: 0 };
            }
            
            this.updateMediaGrid();
            this.updateMediaBadge();
            this.updateMediaPagination();
            
        } catch (error) {
            console.error('Erro ao carregar uploads:', error);
            this.uploads = [];
            this.uploadsPagination = { page: 1, pages: 1, total: 0 };
            this.updateMediaGrid();
            this.updateMediaBadge();
            this.updateMediaPagination();
            this.showToast(`Erro ao carregar mídia: ${error.message}`, 'error');
        }
    }

    async loadMessages(page = 1, limit = 10) {
        try {
            const response = await this.fetchWithTimeout(`/api/admin/messages?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.messages = data.messages || [];
            this.messagesPagination = data.pagination;
            this.unreadCount = data.unreadCount || 0;
            
            this.updateMessagesList();
            this.updateMessagesBadge(this.unreadCount);
            this.updateMessagesPreview();
            
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            this.showToast('Erro ao carregar mensagens', 'error');
        }
    }

    async loadSettings() {
        try {
            console.log('🔄 Carregando configurações...');
            
            const response = await this.fetchWithTimeout('/api/admin/settings');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const settingsArray = await response.json();
            console.log('📊 Dados recebidos do backend:', settingsArray);
            
            this.settings = this.processSettings(settingsArray);
            console.log('⚙️ Configurações processadas:', this.settings);
            
            this.updateSettingsForm();
            this.applyThemeSettings();
            
            console.log('✅ Configurações carregadas com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            console.log('🔄 Usando valores padrão...');
            
            this.settings = this.getDefaultSettings();
            console.log('📋 Configurações padrão aplicadas:', this.settings);
            
            this.updateSettingsForm();
            this.applyThemeSettings();
        }
    }

    async loadContent() {
        try {
            const response = await this.fetchWithTimeout('/api/content');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const contentArray = await response.json();
            this.content = this.processContent(contentArray);
            this.originalContent = JSON.parse(JSON.stringify(this.content));
            this.updateContentEditor();
            
        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            this.content = this.getDefaultContent();
            this.updateContentEditor();
        }
    }

    async loadAnalytics() {
        try {
            const response = await this.fetchWithTimeout('/api/admin/analytics');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.analytics = await response.json();
            this.updateAnalytics();
            this.updateAnalyticsCharts();
            
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
            this.showToast('Erro ao carregar analytics', 'error');
        }
    }

    // ===== REAL-TIME UPDATES =====

    setupRealTimeUpdates() {
        // Simulate WebSocket connection for real-time updates
        this.realTimeUpdates = setInterval(async () => {
            await this.updateOnlineVisitors();
            await this.checkForNewMessages();
            this.updateLastActivity();
        }, 10000);

        // Heartbeat to keep session alive
        setInterval(() => {
            fetch('/api/heartbeat', { method: 'POST', credentials: 'include' }).catch(() => {});
        }, 300000); // Every 5 minutes
    }

    async updateOnlineVisitors() {
        // Simulate real-time visitor count
        const variation = Math.floor(Math.random() * 5) - 2;
        this.onlineVisitors = Math.max(1, this.onlineVisitors + variation);
        
        const onlineCountElement = document.getElementById('onlineCount');
        if (onlineCountElement) {
            const currentCount = parseInt(onlineCountElement.textContent);
            if (currentCount !== this.onlineVisitors) {
                this.animateCounter(onlineCountElement, currentCount, this.onlineVisitors);
            }
        }
    }

    async checkForNewMessages() {
        try {
            const response = await fetch('/api/admin/messages?limit=1', { credentials: 'include' });
            if (!response.ok) return;
            
            const data = await response.json();
            const latestMessage = data.messages[0];
            
            if (latestMessage && new Date(latestMessage.created_at) > this.state.lastUpdate) {
                this.showNotification(`Nova mensagem de ${latestMessage.name}`, 'info', () => {
                    this.switchSection('messages');
                });
                await this.loadMessages();
            }
        } catch (error) {
            console.error('Erro ao verificar novas mensagens:', error);
        }
    }

    // ===== CHARTS =====

    async initializeCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não encontrado. Carregando...');
            await this.loadChartJS();
        }

        this.setupVisitsChart();
        this.setupDevicesChart();
        this.setupAnalyticsChart();
    }

    setupVisitsChart() {
        const canvas = document.getElementById('visitsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const gradientFill = ctx.createLinearGradient(0, 0, 0, 200);
        gradientFill.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradientFill.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

        this.charts.visits = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7DaysLabels(),
                datasets: [{
                    label: 'Visitas',
                    data: this.analytics.dailyVisits?.map(d => d.visits) || [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#667eea',
                    backgroundColor: gradientFill,
                    borderWidth: 3,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(203, 213, 225, 0.3)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
                    }
                }
            }
        });
    }

    setupDevicesChart() {
        const canvas = document.getElementById('devicesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const deviceData = this.analytics.deviceStats || [
            { device_type: 'desktop', count: 45 },
            { device_type: 'mobile', count: 30 },
            { device_type: 'tablet', count: 15 }
        ];

        this.charts.devices = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: deviceData.map(d => this.capitalizeFirst(d.device_type)),
                datasets: [{
                    data: deviceData.map(d => d.count),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupAnalyticsChart() {
        const canvas = document.getElementById('analyticsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.analytics = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.getLast30DaysLabels(),
                datasets: [{
                    label: 'Visitas Diárias',
                    data: this.generateAnalyticsData(),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                const date = new Date();
                                date.setDate(date.getDate() - (29 - context[0].dataIndex));
                                return date.toLocaleDateString('pt-BR');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(203, 213, 225, 0.3)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }

    // ===== UI UPDATES =====

    switchSection(section) {
        if (this.state.loading) return;

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Animate section transition
        const currentSection = document.querySelector('.content-section.active');
        const newSection = document.getElementById(`section-${section}`);

        if (currentSection) {
            currentSection.style.opacity = '0';
            setTimeout(() => {
                currentSection.classList.remove('active');
                newSection.classList.add('active');
                newSection.style.opacity = '1';
            }, 150);
        } else {
            newSection.classList.add('active');
        }

        // Update header with animation
        this.updatePageHeader(section);
        
        this.currentSection = section;
        this.loadSectionData(section);
        
        // Update URL without page reload
        history.pushState({ section }, '', `#${section}`);
    }

    updatePageHeader(section) {
        const titles = {
            dashboard: 'Dashboard',
            projects: 'Gerenciar Projetos',
            content: 'Editor de Conteúdo',
            media: 'Gerenciador de Mídia',
            messages: 'Mensagens de Contato',
            analytics: 'Analytics & Estatísticas',
            settings: 'Configurações do Site'
        };

        const descriptions = {
            dashboard: 'Visão geral do seu portfólio e atividades recentes',
            projects: 'Adicione, edite e gerencie seus projetos do portfólio',
            content: 'Edite todos os textos e conteúdos do seu site',
            media: 'Faça upload e gerencie suas imagens e arquivos',
            messages: 'Gerencie as mensagens recebidas através do formulário',
            analytics: 'Monitore o desempenho e visitantes do seu site',
            settings: 'Configure aspectos gerais e preferências do seu portfólio'
        };

        document.getElementById('pageTitle').textContent = titles[section];
        document.getElementById('breadcrumb').innerHTML = `
            <span>Home</span>
            <i class="fas fa-chevron-right"></i>
            <span>${titles[section]}</span>
        `;

        // Update section description if exists
        const sectionTitle = document.querySelector(`#section-${section} .section-title p`);
        if (sectionTitle) {
            sectionTitle.textContent = descriptions[section];
        }
    }

    updateDashboard() {
        // Animate stats updates
        this.animateCounter(document.getElementById('totalProjectsStat'), 0, this.projects.length);
        this.animateCounter(document.getElementById('totalVisitsStat'), 0, this.analytics.summary?.month || 0);
        this.animateCounter(document.getElementById('totalMessagesStat'), 0, this.messages.length);
        this.animateCounter(document.getElementById('totalUploadsStat'), 0, this.uploads.length);

        // Update unread messages
        const unreadCount = this.messages.filter(m => m.status === 'unread').length;
        const unreadElement = document.getElementById('unreadMessages');
        if (unreadElement) {
            unreadElement.innerHTML = `<i class="fas fa-circle"></i> ${unreadCount} não lidas`;
            unreadElement.className = unreadCount > 0 ? 'stat-change negative' : 'stat-change';
        }

        // Update storage info
        const totalSize = this.uploads.reduce((sum, upload) => sum + (upload.file_size || 0), 0);
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
        document.getElementById('storageUsed').textContent = `${sizeInMB} MB`;

        // Update activity feed
        this.updateActivityFeed();
        
        // Update recent messages preview
        this.updateMessagesPreview();
    }

    updateActivityFeed() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        // Generate recent activity from various sources
        const activities = [];

        // Recent projects
        this.projects.slice(0, 3).forEach(project => {
            activities.push({
                type: 'project',
                icon: 'fa-code',
                title: `Projeto "${project.titulo}" ${project.id > 100 ? 'atualizado' : 'criado'}`,
                time: project.updated_at || project.created_at,
                color: 'var(--primary-color)'
            });
        });

        // Recent uploads
        this.uploads.slice(0, 2).forEach(upload => {
            activities.push({
                type: 'upload',
                icon: 'fa-cloud-upload-alt',
                title: `Arquivo "${upload.original_name}" enviado`,
                time: upload.created_at,
                color: 'var(--info-color)'
            });
        });

        // Recent messages
        this.messages.slice(0, 2).forEach(message => {
            activities.push({
                type: 'message',
                icon: 'fa-envelope',
                title: `Nova mensagem de ${message.name}`,
                time: message.created_at,
                color: 'var(--warning-color)'
            });
        });

        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        activityList.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>Atividade recente do sistema</p>
                </div>
                <div class="activity-time">
                    ${this.formatRelativeTime(activity.time)}
                </div>
            </div>
        `).join('') || '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhuma atividade recente</div>';
    }

    updateMessagesPreview() {
        const messagesPreview = document.getElementById('messagesPreview');
        if (!messagesPreview) return;

        const recentMessages = this.messages.slice(0, 3);
        
        messagesPreview.innerHTML = recentMessages.map(message => `
            <div class="message-preview-item" data-action="view-message" data-id="${message.id}">
                <div class="activity-icon message">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="activity-content">
                    <h4>${this.escapeHtml(message.name)}</h4>
                    <p>${this.escapeHtml(message.message).substring(0, 60)}...</p>
                </div>
                <div class="activity-time">
                    ${this.formatRelativeTime(message.created_at)}
                </div>
            </div>
        `).join('') || '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhuma mensagem recente</div>';
    }

    updateProjectsTable() {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;

        if (!this.projects || this.projects.length === 0) {
            tbody.innerHTML = this.getEmptyState('projetos', 'fa-folder-open', 'Nenhum projeto encontrado', 'Comece criando seu primeiro projeto');
            return;
        }

        let filteredProjects = this.projects;
        
        // Apply filters
        if (this.searchFilters.projects) {
            if (this.searchFilters.projects.search) {
                const search = this.searchFilters.projects.search.toLowerCase();
                filteredProjects = filteredProjects.filter(project => 
                    project.titulo.toLowerCase().includes(search) ||
                    project.descricao.toLowerCase().includes(search) ||
                    (project.tecnologias && project.tecnologias.toLowerCase().includes(search))
                );
            }
            
            if (this.searchFilters.projects.status && this.searchFilters.projects.status !== 'all') {
                filteredProjects = filteredProjects.filter(project => {
                    switch (this.searchFilters.projects.status) {
                        case 'active': return project.ativo;
                        case 'inactive': return !project.ativo;
                        case 'featured': return project.destaque;
                        default: return true;
                    }
                });
            }
        }

        tbody.innerHTML = filteredProjects.map(project => {
            const technologies = project.tecnologias ? 
                project.tecnologias.split(',').slice(0, 3).map(tech => tech.trim()) : [];
            
            return `
                <tr data-project-id="${project.id}" class="table-row-animated">
                    <td>
                        <input type="checkbox" data-id="${project.id}" data-action="select-item" data-type="project">
                    </td>
                    <td>
                        <div class="project-info">
                            <div class="project-avatar">
                                ${project.imagem_url ? 
                                    `<img src="${project.imagem_url}" alt="${project.titulo}">` :
                                    '<i class="fas fa-code"></i>'
                                }
                            </div>
                            <div class="project-details">
                                <div class="project-title">${this.escapeHtml(project.titulo)}</div>
                                <div class="project-description">${this.escapeHtml(project.descricao)}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="tech-tags">
                            ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            ${project.tecnologias && project.tecnologias.split(',').length > 3 ? 
                                `<span class="tech-tag more">+${project.tecnologias.split(',').length - 3}</span>` : ''
                            }
                        </div>
                    </td>
                    <td>
                        <div class="status-badges">
                            <button class="status-badge ${project.ativo ? 'active' : 'inactive'}" 
                                    data-action="toggle-project-status" 
                                    data-id="${project.id}" 
                                    data-current-status="${project.ativo}"
                                    title="Clique para ${project.ativo ? 'desativar' : 'ativar'}">
                                <i class="fas ${project.ativo ? 'fa-eye' : 'fa-eye-slash'}"></i>
                                ${project.ativo ? 'Ativo' : 'Inativo'}
                            </button>
                            ${project.destaque ? '<span class="status-badge featured"><i class="fas fa-star"></i> Destaque</span>' : ''}
                        </div>
                    </td>
                    <td class="date-column">
                        ${this.formatDate(project.created_at)}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-secondary" data-action="edit-project" data-id="${project.id}" title="Editar projeto">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm" style="background: var(--info-color); color: white;" data-action="duplicate-project" data-id="${project.id}" title="Duplicar projeto">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="delete-project" data-id="${project.id}" title="Excluir projeto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add animation to new rows
        setTimeout(() => {
            tbody.querySelectorAll('.table-row-animated').forEach((row, index) => {
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }, 10);
    }

    updateMediaGrid() {
        const grid = document.getElementById('mediaGrid');
        if (!grid) return;

        if (!this.uploads || this.uploads.length === 0) {
            grid.innerHTML = this.getEmptyState('mídia', 'fa-images', 'Nenhum arquivo de mídia', 'Faça upload de suas primeiras imagens');
            return;
        }

        let filteredUploads = this.uploads;
        
        // Apply filters
        if (this.searchFilters.media) {
            if (this.searchFilters.media.search) {
                const search = this.searchFilters.media.search.toLowerCase();
                filteredUploads = filteredUploads.filter(upload => 
                    upload.original_name.toLowerCase().includes(search) ||
                    (upload.alt_text && upload.alt_text.toLowerCase().includes(search))
                );
            }
            
            if (this.searchFilters.media.type && this.searchFilters.media.type !== 'all') {
                filteredUploads = filteredUploads.filter(upload => 
                    upload.mime_type === this.searchFilters.media.type
                );
            }
        }

        grid.innerHTML = filteredUploads.map(upload => `
            <div class="media-item" data-id="${upload.id}">
                <div class="media-checkbox">
                    <input type="checkbox" data-id="${upload.id}" data-action="select-item" data-type="media">
                </div>
                <div class="media-preview">
                    ${upload.mime_type.startsWith('image/') ? 
                        `<img src="${upload.file_path}" alt="${upload.alt_text || upload.original_name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="file-icon error-icon" style="display:none; color: #ff6b6b;"><i class="fas fa-image-slash"></i><span style="font-size: 0.8rem; margin-top: 0.5rem;">Arquivo não encontrado</span></div>` :
                        `<div class="file-icon"><i class="fas fa-file"></i></div>`
                    }
                    <div class="media-overlay">
                        <div class="media-actions">
                            <button class="media-action-btn" data-action="view-media" data-id="${upload.id}" title="Visualizar">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="media-action-btn" data-action="copy-media-url" data-url="${upload.file_path}" title="Copiar URL">
                                <i class="fas fa-link"></i>
                            </button>
                            <button class="media-action-btn danger" data-action="delete-media" data-id="${upload.id}" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="media-info">
                    <h4 title="${upload.original_name}">${upload.original_name}</h4>
                    <p>
                        ${this.formatFileSize(upload.file_size)} • 
                        ${this.formatDate(upload.created_at)}
                    </p>
                </div>
            </div>
        `).join('');
    }

    updateMessagesList() {
        const list = document.getElementById('messagesList');
        if (!list) return;

        if (!this.messages || this.messages.length === 0) {
            list.innerHTML = this.getEmptyState('mensagens', 'fa-envelope', 'Nenhuma mensagem', 'As mensagens de contato aparecerão aqui');
            return;
        }

        let filteredMessages = this.messages;
        
        // Apply filters
        if (this.searchFilters.messages) {
            if (this.searchFilters.messages.search) {
                const search = this.searchFilters.messages.search.toLowerCase();
                filteredMessages = filteredMessages.filter(message => 
                    message.name.toLowerCase().includes(search) ||
                    message.email.toLowerCase().includes(search) ||
                    message.message.toLowerCase().includes(search) ||
                    (message.subject && message.subject.toLowerCase().includes(search))
                );
            }
            
            if (this.searchFilters.messages.status && this.searchFilters.messages.status !== 'all') {
                filteredMessages = filteredMessages.filter(message => 
                    message.status === this.searchFilters.messages.status
                );
            }
        }

        list.innerHTML = filteredMessages.map(message => `
            <div class="message-item ${message.status === 'unread' ? 'unread' : ''}" 
                 data-id="${message.id}"
                 data-message-id="${message.id}">
                <div class="message-checkbox">
                    <input type="checkbox" data-id="${message.id}" data-action="select-item" data-type="message">
                </div>
                <div class="message-header" data-action="view-message" data-id="${message.id}">
                    <div class="message-info">
                        <h4>
                            ${this.escapeHtml(message.name)}
                            ${message.status === 'unread' ? '<span class="new-badge">Nova</span>' : ''}
                        </h4>
                        <p>
                            ${this.escapeHtml(message.email)} • 
                            ${this.escapeHtml(message.subject || 'Sem assunto')}
                        </p>
                    </div>
                    <div class="message-actions">
                        <div class="message-time">
                            ${this.formatRelativeTime(message.created_at)}
                        </div>
                        <div class="message-action-buttons">
                            <button class="btn btn-sm" data-action="mark-message-read" data-id="${message.id}" title="Marcar como lida">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="delete-message" data-id="${message.id}" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="message-content">
                    ${this.escapeHtml(message.message).substring(0, 150)}${message.message.length > 150 ? '...' : ''}
                </div>
            </div>
        `).join('');
    }

    // ===== ADVANCED FEATURES =====

    async handleMultipleFileUpload(files) {
        const uploadPromises = [];
        const maxConcurrent = 3;
        let currentIndex = 0;

        const uploadNext = async () => {
            if (currentIndex >= files.length) return;
            
            const file = files[currentIndex++];
            if (!file.type.startsWith('image/')) {
                this.showToast(`Arquivo ${file.name} ignorado (apenas imagens são suportadas)`, 'warning');
                return uploadNext();
            }

            try {
                const result = await this.uploadSingleFileAdvanced(file);
                this.showUploadProgress(file.name, 100, 'success');
                return result;
            } catch (error) {
                this.showUploadProgress(file.name, 0, 'error');
                console.error(`Erro no upload de ${file.name}:`, error);
            }
            
            return uploadNext();
        };

        // Start concurrent uploads
        for (let i = 0; i < Math.min(maxConcurrent, files.length); i++) {
            uploadPromises.push(uploadNext());
        }

        await Promise.all(uploadPromises);
        await this.loadUploads();
        this.showToast(`Upload concluído! ${files.length} arquivo(s) processado(s).`, 'success');
    }

    async uploadSingleFileAdvanced(file) {
        const formData = new FormData();
        formData.append('image', file);

        // Show initial progress
        this.showUploadProgress(file.name, 0, 'uploading');

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            return result;
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    showUploadProgress(fileName, progress, status) {
        // Create or update progress indicator
        let progressContainer = document.getElementById('uploadProgress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'uploadProgress';
            progressContainer.className = 'upload-progress-container';
            document.body.appendChild(progressContainer);
        }

        const progressId = `progress-${fileName.replace(/[^a-zA-Z0-9]/g, '')}`;
        let progressItem = document.getElementById(progressId);

        if (!progressItem) {
            progressItem = document.createElement('div');
            progressItem.id = progressId;
            progressItem.className = 'upload-progress-item';
            progressContainer.appendChild(progressItem);
        }

        const statusClass = status === 'success' ? 'success' : status === 'error' ? 'error' : 'uploading';
        const statusIcon = status === 'success' ? 'fa-check' : status === 'error' ? 'fa-times' : 'fa-spinner fa-spin';

        progressItem.innerHTML = `
            <div class="upload-progress-info">
                <span class="upload-filename">${fileName}</span>
                <i class="fas ${statusIcon} upload-status-icon ${statusClass}"></i>
            </div>
            <div class="upload-progress-bar">
                <div class="upload-progress-fill ${statusClass}" style="width: ${progress}%"></div>
            </div>
        `;

        if (status === 'success' || status === 'error') {
            setTimeout(() => {
                progressItem.remove();
                if (progressContainer.children.length === 0) {
                    progressContainer.remove();
                }
            }, 3000);
        }
    }

    async handleProjectImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                this.showToast('Apenas arquivos de imagem são suportados', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                this.showToast('Arquivo muito grande. Máximo 10MB.', 'error');
                return;
            }

            // Show preview before upload
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Upload file
            const result = await this.uploadSingleFileAdvanced(file);
            if (result && result.file) {
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('previewImg');
                
                previewImg.src = result.file.url;
                preview.dataset.url = result.file.url;
                
                this.showToast('Imagem enviada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro no upload da imagem:', error);
            this.showToast('Erro no upload da imagem', 'error');
        }
    }

    showImagePreview(src) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imageUploadArea');
        const previewImg = document.getElementById('previewImg');

        previewImg.src = src;
        placeholder.style.display = 'none';
        preview.style.display = 'block';
    }

    removeImage() {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imageUploadArea');
        const previewImg = document.getElementById('previewImg');
        const projectImageInput = document.getElementById('project-image');

        if (preview) {
            preview.style.display = 'none';
            preview.removeAttribute('data-url');
        }
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        if (previewImg) {
            previewImg.src = '';
        }
        if (projectImageInput) {
            projectImageInput.value = '';
        }
    }

    // ===== FILTERING AND SEARCHING =====

    filterProjects(search = '', status = 'all') {
        this.searchFilters.projects = { search, status };
        this.updateProjectsTable();
    }

    filterMedia(search = '', type = 'all') {
        this.searchFilters.media = { search, type };
        this.updateMediaGrid();
    }

    filterMessages(search = '', status = 'all') {
        this.searchFilters.messages = { search, status };
        this.updateMessagesList();
    }

    // ===== HELPER FUNCTIONS =====

    async fetchWithTimeout(url, timeout = 10000, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { 
                signal: controller.signal,
                credentials: 'include', // Inclui cookies de sessão
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    animateCounter(element, start, end, duration = 1000) {
        if (!element) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'agora há pouco';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
        
        return time.toLocaleDateString('pt-BR');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getEmptyState(type, icon, title, subtitle) {
        return `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                <div class="empty-icon" style="font-size: 4rem; margin-bottom: 1rem; color: var(--text-tertiary);">
                    <i class="fas ${icon}"></i>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">${title}</h3>
                <p style="font-size: 1rem; margin-bottom: 2rem;">${subtitle}</p>
                ${type === 'projetos' ? '<button class="btn btn-primary" data-action="open-project-modal"><i class="fas fa-plus"></i> Criar Primeiro Projeto</button>' : ''}
                ${type === 'mídia' ? '<button class="btn btn-primary" data-action="trigger-file-input"><i class="fas fa-cloud-upload-alt"></i> Fazer Upload</button>' : ''}
            </div>
        `;
    }

    getLast7DaysLabels() {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
        return labels;
    }

    getLast30DaysLabels() {
        const labels = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.getDate().toString());
        }
        return labels;
    }

    generateAnalyticsData() {
        // Generate realistic analytics data
        const data = [];
        for (let i = 0; i < 30; i++) {
            const baseValue = 20 + Math.random() * 50;
            const weekendMultiplier = (i % 7 === 0 || i % 7 === 6) ? 0.7 : 1;
            data.push(Math.floor(baseValue * weekendMultiplier));
        }
        return data;
    }

    showLoadingScreen() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showToast(message, type = 'success', action = null) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = toast.querySelector('.toast-icon i');
        
        // Clear previous timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        // Update icon
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toastIcon.className = `fas ${icons[type] || icons.success}`;
        
        toast.classList.add('show');
        
        // Add action if provided
        if (action) {
            toast.style.cursor = 'pointer';
            toast.onclick = action;
        } else {
            toast.style.cursor = 'default';
            toast.onclick = null;
        }
        
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, type === 'error' ? 6000 : 4000);
    }

    trackUserAction(action, data = {}) {
        // Track user actions for analytics
        console.log(`User action: ${action}`, data);
        // Could send to analytics service
    }

    hasUnsavedChanges() {
        // Check for unsaved changes in forms
        return false; // Implement actual change detection
    }

    hasContentChanges() {
        if (!this.originalContent || !this.content) return false;
        return JSON.stringify(this.originalContent) !== JSON.stringify(this.content);
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Erro no logout:', error);
            window.location.reload();
        }
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            // Use requestIdleCallback for better performance
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => func.apply(this, args));
            } else {
                func.apply(this, args);
            }
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Global functions for HTML onclick handlers
function switchSection(section) {
    adminApp.switchSection(section);
}

function closeModal(modalId) {
    adminApp.closeModal(modalId);
}

function removeImage() {
    adminApp.removeImage();
}

function hideToast() {
    adminApp.hideToast();
}

// Initialize app
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new SuperAdminApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause real-time updates
        if (adminApp.realTimeUpdates) {
            clearInterval(adminApp.realTimeUpdates);
        }
    } else {
        // Page is visible, resume real-time updates
        adminApp.setupRealTimeUpdates();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (adminApp) {
        adminApp.showToast('Conexão restabelecida', 'success');
    }
});

window.addEventListener('offline', () => {
    if (adminApp) {
        adminApp.showToast('Trabalhando offline', 'warning');
    }
});

// Missing methods for SuperAdminApp
SuperAdminApp.prototype.updateProjectsBadge = function() {
    const badge = document.getElementById('projectsBadge');
    if (badge && this.projects) {
        badge.textContent = this.projects.length;
    }
};

// Action methods
SuperAdminApp.prototype.refreshChart = function(chartType) {
    console.log(`Atualizando gráfico: ${chartType}`);
    if (chartType === 'visits' && this.charts.visits) {
        this.charts.visits.update();
        this.showToast('Gráfico atualizado', 'success');
    }
};

SuperAdminApp.prototype.refreshActivity = function() {
    console.log('Atualizando atividade recente');
    this.updateActivityFeed();
    this.showToast('Atividade atualizada', 'success');
};

SuperAdminApp.prototype.exportProjects = function() {
    try {
        if (!this.projects || this.projects.length === 0) {
            this.showToast('Nenhum projeto para exportar', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.projects, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `projetos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        this.showToast(`${this.projects.length} projetos exportados com sucesso`, 'success');
    } catch (error) {
        console.error('Erro ao exportar projetos:', error);
        this.showToast('Erro ao exportar projetos', 'error');
    }
};

// Renderizar lista de tecnologias com chips clicáveis
SuperAdminApp.prototype.populateTechnologySelect = function(selectedValues = []) {
    const container = document.getElementById('technologyChips');
    const hiddenInput = document.getElementById('project-technologies');
    if (!container || !hiddenInput) return;

    const currentSelection = selectedValues.length ? selectedValues : this.getSelectedTechnologiesList();
    container.innerHTML = '';

    const uniqueSelection = Array.from(new Set(currentSelection));
    hiddenInput.value = uniqueSelection.join(', ');

    TECHNOLOGY_OPTIONS.forEach(tech => {
        container.appendChild(this.createTechnologyChip(tech, uniqueSelection.includes(tech)));
    });

    // Preservar tecnologias personalizadas
    uniqueSelection
        .filter(tech => !TECHNOLOGY_OPTIONS.includes(tech))
        .forEach(customTech => container.appendChild(this.createTechnologyChip(customTech, true)));
};

// Criar chip de tecnologia com ícone
SuperAdminApp.prototype.createTechnologyChip = function(tech, isSelected = false) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `tech-chip ${isSelected ? 'active' : ''}`;
    chip.dataset.value = tech;
    chip.setAttribute('aria-pressed', isSelected);

    const iconClass = TECHNOLOGY_ICONS[tech] || 'fa-solid fa-circle';
    chip.innerHTML = `
        <span class="tech-icon"><i class="${iconClass}"></i></span>
        <span class="tech-label">${tech}</span>
        <span class="tech-check"><i class="fas fa-check"></i></span>
    `;

    chip.addEventListener('click', () => {
        this.toggleTechnology(tech);
    });

    return chip;
};

SuperAdminApp.prototype.toggleTechnology = function(tech) {
    const selected = this.getSelectedTechnologiesList();
    const exists = selected.findIndex(item => item.toLowerCase() === tech.toLowerCase());

    if (exists >= 0) {
        selected.splice(exists, 1);
    } else {
        selected.push(tech);
    }

    this.updateTechnologySelection(selected);
};

SuperAdminApp.prototype.updateTechnologySelection = function(selectedList = []) {
    const hiddenInput = document.getElementById('project-technologies');
    if (!hiddenInput) return;

    const unique = Array.from(new Set(selectedList.map(item => item.trim()).filter(Boolean)));
    hiddenInput.value = unique.join(', ');
    this.syncTechnologyChips(unique);
};

SuperAdminApp.prototype.syncTechnologyChips = function(selectedList = []) {
    const chips = document.querySelectorAll('#technologyChips .tech-chip');
    chips.forEach(chip => {
        const value = chip.dataset.value;
        const isSelected = selectedList.some(item => item.toLowerCase() === value.toLowerCase());
        chip.classList.toggle('active', isSelected);
        chip.setAttribute('aria-pressed', isSelected);
    });
};

SuperAdminApp.prototype.getSelectedTechnologiesList = function() {
    const hiddenInput = document.getElementById('project-technologies');
    if (!hiddenInput) return [];
    return hiddenInput.value.split(',').map(t => t.trim()).filter(Boolean);
};

// Aplicar seleção de tecnologias existentes em um projeto
SuperAdminApp.prototype.setTechnologiesInSelect = function(techString = '') {
    const values = techString.split(',').map(t => t.trim()).filter(Boolean);
    this.populateTechnologySelect(values);
    this.syncTechnologyChips(values);
};

// Obter tecnologias selecionadas como string para salvar
SuperAdminApp.prototype.getSelectedTechnologies = function() {
    return this.getSelectedTechnologiesList().join(', ');
};

SuperAdminApp.prototype.addCustomTechnology = function(value) {
    const tech = value.trim();
    const container = document.getElementById('technologyChips');
    if (!tech || !container) return;

    const existingChip = Array.from(container.querySelectorAll('.tech-chip'))
        .find(chip => chip.dataset.value.toLowerCase() === tech.toLowerCase());

    if (!existingChip) {
        container.appendChild(this.createTechnologyChip(tech, true));
    }

    const selected = this.getSelectedTechnologiesList();
    selected.push(tech);
    this.updateTechnologySelection(selected);
};

// Função para abrir modal de projeto
SuperAdminApp.prototype.openProjectModal = function(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('projectModalTitle');
    const form = document.getElementById('projectForm');
    
    if (!modal || !form) {
        this.showToast('Erro: Modal não encontrado', 'error');
        return;
    }

    // Limpar formulário
    form.reset();
    document.getElementById('projectId').value = '';
    this.setTechnologiesInSelect('');
    
    // Limpar preview de imagem
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadArea = document.getElementById('imageUploadArea');
    if (imagePreview && imageUploadArea) {
        imagePreview.style.display = 'none';
        imageUploadArea.style.display = 'block';
    }

    if (projectId) {
        // Modo edição
        modalTitle.textContent = 'Editar Projeto';
        this.loadProjectToForm(projectId);
    } else {
        // Modo criação
        modalTitle.textContent = 'Novo Projeto';
        // Marcar projeto como ativo por padrão
        document.getElementById('project-active').checked = true;
    }

    // Mostrar modal
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = form.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 100);
};

// Função para carregar projeto no formulário
SuperAdminApp.prototype.loadProjectToForm = function(projectId) {
    const project = this.projects.find(p => p.id == projectId);
    if (!project) {
        this.showToast('Projeto não encontrado', 'error');
        return;
    }

    document.getElementById('projectId').value = project.id;
    document.getElementById('project-title').value = project.titulo || '';
    document.getElementById('project-description').value = project.descricao || '';
    this.setTechnologiesInSelect(project.tecnologias || '');
    document.getElementById('project-github').value = project.github_url || '';
    document.getElementById('project-demo').value = project.demo_url || '';
    document.getElementById('project-featured').checked = Boolean(project.destaque);
    document.getElementById('project-active').checked = Boolean(project.ativo);

    // Carregar imagem se existir
    if (project.imagem_url) {
        this.showImagePreview(project.imagem_url);
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.dataset.url = project.imagem_url;
        }
    }
};

// Função para editar projeto
SuperAdminApp.prototype.editProject = function(projectId) {
    console.log(`Editando projeto ID: ${projectId}`);
    this.openProjectModal(projectId);
};

// Função para duplicar projeto
SuperAdminApp.prototype.duplicateProject = function(projectId) {
    const project = this.projects.find(p => p.id == projectId);
    if (!project) {
        this.showToast('Projeto não encontrado', 'error');
        return;
    }

    this.openProjectModal();
    
    // Preencher com dados do projeto original após um pequeno delay
    setTimeout(() => {
        document.getElementById('project-title').value = `${project.titulo} (Cópia)`;
        document.getElementById('project-description').value = project.descricao || '';
        this.setTechnologiesInSelect(project.tecnologias || '');
        document.getElementById('project-github').value = '';  // Limpar URLs específicas
        document.getElementById('project-demo').value = '';
        document.getElementById('project-featured').checked = false;  // Não marcar como destaque
        document.getElementById('project-active').checked = true;

        if (project.imagem_url) {
            this.showImagePreview(project.imagem_url);
        }
    }, 100);

    this.showToast('Projeto duplicado. Edite os dados e salve.', 'info');
};

// Função para excluir projeto
SuperAdminApp.prototype.deleteProject = function(projectId) {
    const project = this.projects.find(p => p.id == projectId);
    if (!project) {
        this.showToast('Projeto não encontrado', 'error');
        return;
    }

    // Confirmar exclusão
    if (confirm(`Tem certeza que deseja excluir o projeto "${project.titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
        this.performDeleteProject(projectId, project.titulo);
    }
};

// Função para executar exclusão do projeto
SuperAdminApp.prototype.performDeleteProject = async function(projectId, projectTitle) {
    try {
        this.showToast('Excluindo projeto...', 'info');
        
        const response = await fetch(`/api/admin/projetos/${projectId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        // Remover projeto da lista local
        this.projects = this.projects.filter(p => p.id != projectId);
        
        // Atualizar interface
        this.updateProjectsTable();
        this.updateProjectsBadge();
        
        this.showToast(`Projeto "${projectTitle}" excluído com sucesso`, 'success');
        
    } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        this.showToast(`Erro ao excluir projeto: ${error.message}`, 'error');
    }
};

// Função para lidar com submit do formulário de projeto
SuperAdminApp.prototype.handleProjectSubmit = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const projectId = document.getElementById('projectId').value;
    
    // Validar campos obrigatórios
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    
    if (!title || !description) {
        this.showToast('Título e descrição são obrigatórios', 'error');
        return;
    }

    // Preparar dados do projeto
    const projectData = {
        titulo: title,
        descricao: description,
        tecnologias: this.getSelectedTechnologies(),
        github_url: document.getElementById('project-github').value.trim(),
        demo_url: document.getElementById('project-demo').value.trim(),
        destaque: document.getElementById('project-featured').checked,
        ativo: document.getElementById('project-active').checked
    };

    // Verificar se há imagem para upload
    const imageFile = document.getElementById('project-image').files[0];
    const existingImageUrl = document.getElementById('imagePreview').dataset.url;

    try {
        const isEdit = projectId && projectId !== '';
        this.showToast(isEdit ? 'Atualizando projeto...' : 'Criando projeto...', 'info');

        let imageUrl = existingImageUrl;

        // Upload de imagem se houver
        if (imageFile) {
            imageUrl = await this.uploadProjectImage(imageFile);
        }

        // Adicionar URL da imagem aos dados
        if (imageUrl) {
            projectData.imagem_url = imageUrl;
        }

        // Enviar dados para o servidor
        const url = isEdit ? `/api/admin/projetos/${projectId}` : '/api/admin/projetos';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Atualizar lista de projetos
        if (isEdit) {
            // Atualizar projeto existente na lista
            const index = this.projects.findIndex(p => p.id == projectId);
            if (index !== -1) {
                this.projects[index] = { ...result, id: parseInt(projectId) };
            }
        } else {
            // Adicionar novo projeto à lista
            this.projects.unshift(result);
        }

        // Atualizar interface
        this.updateProjectsTable();
        this.updateProjectsBadge();

        // Fechar modal
        this.closeModal('projectModal');

        this.showToast(
            isEdit ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!', 
            'success'
        );

    } catch (error) {
        console.error('Erro ao salvar projeto:', error);
        this.showToast(`Erro ao salvar projeto: ${error.message}`, 'error');
    }
};

// Função para upload de imagem do projeto
SuperAdminApp.prototype.uploadProjectImage = async function(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro no upload: HTTP ${response.status}`);
        }

        const result = await response.json();
        return result.file?.url || result.file?.file_path;
        
    } catch (error) {
        console.error('Erro no upload da imagem:', error);
        throw new Error(`Erro no upload da imagem: ${error.message}`);
    }
};

// Função de validação de campo
SuperAdminApp.prototype.validateField = function(field) {
    if (!field) return;
    
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Validação por tipo de campo
    switch (field.id) {
        case 'project-title':
            isValid = value.length >= 3;
            message = 'Título deve ter pelo menos 3 caracteres';
            break;
        case 'project-description':
            isValid = value.length >= 10;
            message = 'Descrição deve ter pelo menos 10 caracteres';
            break;
        case 'project-github':
        case 'project-demo':
            if (value) {
                isValid = value.startsWith('http://') || value.startsWith('https://');
                message = 'URL deve começar com http:// ou https://';
            }
            break;
    }

    // Aplicar estilos de validação
    if (field.required && !value) {
        field.classList.add('invalid');
        field.classList.remove('valid');
    } else if (value && !isValid) {
        field.classList.add('invalid');
        field.classList.remove('valid');
        // Mostrar mensagem de erro (pode implementar tooltip)
        field.title = message;
    } else if (value) {
        field.classList.add('valid');
        field.classList.remove('invalid');
        field.title = '';
    } else {
        field.classList.remove('valid', 'invalid');
        field.title = '';
    }

    return isValid;
};

// Função para alternar status do projeto (ativo/inativo)
SuperAdminApp.prototype.toggleProjectStatus = async function(projectId, newStatus) {
    try {
        this.showToast('Alterando status...', 'info');
        
        const response = await fetch(`/api/admin/projetos/${projectId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ativo: newStatus })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        // Atualizar projeto na lista local
        const project = this.projects.find(p => p.id == projectId);
        if (project) {
            project.ativo = newStatus;
            
            // Atualizar tabela
            this.updateProjectsTable();
            
            this.showToast(
                `Projeto ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 
                'success'
            );
        }
        
    } catch (error) {
        console.error('Erro ao alterar status do projeto:', error);
        this.showToast(`Erro ao alterar status: ${error.message}`, 'error');
    }
};

// Função para lidar com seleção de itens (checkboxes)
SuperAdminApp.prototype.handleItemSelection = function(checkbox, itemKey) {
    if (checkbox.checked) {
        this.selectedItems.add(itemKey);
    } else {
        this.selectedItems.delete(itemKey);
    }
    
    // Atualizar ações em massa
    this.updateBulkActions();
};

// Função para atualizar ações em massa
SuperAdminApp.prototype.updateBulkActions = function() {
    const selectedCount = this.selectedItems.size;
    
    // Atualizar checkbox "selecionar todos"
    const selectAllCheckbox = document.getElementById('selectAllProjects');
    if (selectAllCheckbox) {
        const totalProjects = this.projects.length;
        const selectedProjects = Array.from(this.selectedItems).filter(item => item.startsWith('project-')).length;
        
        selectAllCheckbox.indeterminate = selectedProjects > 0 && selectedProjects < totalProjects;
        selectAllCheckbox.checked = selectedProjects === totalProjects && totalProjects > 0;
    }
    
    // Mostrar/ocultar botões de ação em massa
    const bulkActions = document.querySelectorAll('[data-action="bulk-delete"]');
    bulkActions.forEach(btn => {
        btn.disabled = selectedCount === 0;
        btn.textContent = selectedCount > 0 ? 
            `Excluir Selecionados (${selectedCount})` : 
            'Excluir Selecionados';
    });
};

// Funções para processar dados
SuperAdminApp.prototype.processSettings = function(settingsArray) {
    const settings = {};
    if (Array.isArray(settingsArray)) {
        settingsArray.forEach(setting => {
            let value = setting.setting_value;
            
            // Converter valores baseados no tipo
            if (setting.setting_type === 'boolean') {
                value = value === 'true' || value === true;
            } else if (setting.setting_type === 'number') {
                value = parseFloat(value) || 0;
            }
            
            settings[setting.setting_key] = value;
        });
    }
    return settings;
};

SuperAdminApp.prototype.detectSettingsChanges = function() {
    const currentFormData = {};
    const fieldsToCheck = [
        { id: 'site-title', key: 'site_title', type: 'value' },
        { id: 'main-email', key: 'main_email', type: 'value' },
        { id: 'site-description', key: 'site_description', type: 'value' },
        { id: 'maintenance-mode', key: 'maintenance_mode', type: 'checked' },
        { id: 'analytics-enabled', key: 'analytics_enabled', type: 'checked' },
        { id: 'primary-color', key: 'primary_color', type: 'value' },
        { id: 'secondary-color', key: 'secondary_color', type: 'value' },
        { id: 'meta-description', key: 'meta_description', type: 'value' },
        { id: 'github-url', key: 'github_url', type: 'value' },
        { id: 'linkedin-url', key: 'linkedin_url', type: 'value' }
    ];
    
    fieldsToCheck.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            if (field.type === 'checked') {
                currentFormData[field.key] = element.checked;
            } else {
                currentFormData[field.key] = element.value?.trim() || '';
            }
        }
    });
    
    const savedSettings = { ...this.getDefaultSettings(), ...this.settings };
    const changes = {};
    
    Object.keys(currentFormData).forEach(key => {
        if (currentFormData[key] !== savedSettings[key]) {
            changes[key] = {
                old: savedSettings[key],
                new: currentFormData[key]
            };
        }
    });
    
    return { hasChanges: Object.keys(changes).length > 0, changes, currentData: currentFormData };
};

SuperAdminApp.prototype.highlightChangedFields = function() {
    const detection = this.detectSettingsChanges();
    
    // Remover highlights existentes
    document.querySelectorAll('.field-changed, .field-unchanged').forEach(el => {
        el.classList.remove('field-changed', 'field-unchanged');
    });
    
    // Adicionar highlights baseados nas mudanças
    Object.keys(detection.currentData).forEach(key => {
        const fieldId = key.replace(/_/g, '-');
        const element = document.getElementById(fieldId);
        const container = element?.closest('.form-group') || element?.parentElement;
        
        if (container) {
            if (detection.changes[key]) {
                container.classList.add('field-changed');
                container.title = `Alterado: ${detection.changes[key].old} → ${detection.changes[key].new}`;
            } else {
                container.classList.add('field-unchanged');
                container.title = 'Campo sem alterações';
            }
        }
    });
    
    // Atualizar contador de mudanças
    const changesCount = Object.keys(detection.changes).length;
    const saveButton = document.querySelector('[data-action="save-settings"]');
    if (saveButton) {
        if (changesCount > 0) {
            saveButton.innerHTML = `<i class="fas fa-save"></i> Salvar Alterações (${changesCount})`;
            saveButton.classList.add('btn-warning');
            saveButton.classList.remove('btn-primary');
        } else {
            saveButton.innerHTML = `<i class="fas fa-save"></i> Salvar Configurações`;
            saveButton.classList.add('btn-primary');
            saveButton.classList.remove('btn-warning');
        }
    }
};

SuperAdminApp.prototype.getDefaultSettings = function() {
    return {
        site_title: 'Meu Portfólio',
        main_email: 'admin@exemplo.com',
        site_description: 'Descrição do site',
        maintenance_mode: false,
        analytics_enabled: true,
        primary_color: '#667eea',  // Cor real da index.html
        secondary_color: '#764ba2', // Cor real da index.html
        meta_description: 'Meta descrição padrão',
        github_url: '',
        linkedin_url: ''
    };
};

SuperAdminApp.prototype.updateSettingsForm = function() {
    // Preencher formulário com valores das configurações (com merge inteligente)
    const setFieldValue = (id, value, type = 'value') => {
        const field = document.getElementById(id);
        if (field) {
            // Se o campo já tem um valor e o novo valor está vazio, manter o atual
            if (type === 'checked') {
                field.checked = Boolean(value);
            } else {
                if (value !== null && value !== undefined) {
                    field.value = value;
                } else if (!field.value) {
                    // Só definir vazio se o campo realmente estiver vazio
                    field.value = '';
                }
            }
        }
    };

    // Obter configurações com valores padrão como fallback
    const settings = { ...this.getDefaultSettings(), ...this.settings };
    
    // Aba Geral
    setFieldValue('site-title', settings.site_title);
    setFieldValue('main-email', settings.main_email);
    setFieldValue('site-description', settings.site_description);
    setFieldValue('maintenance-mode', settings.maintenance_mode, 'checked');
    setFieldValue('analytics-enabled', settings.analytics_enabled, 'checked');
    
    // Aba Aparência  
    setFieldValue('primary-color', settings.primary_color);
    setFieldValue('secondary-color', settings.secondary_color);
    
    // Aba SEO
    setFieldValue('meta-description', settings.meta_description);
    
    // Aba Redes Sociais
    setFieldValue('github-url', settings.github_url);
    setFieldValue('linkedin-url', settings.linkedin_url);
    
    // Destacar campos após preenchimento
    setTimeout(() => this.highlightChangedFields(), 500);
};

SuperAdminApp.prototype.forceUpdateForm = function() {
    console.log('🔄 Forçando atualização do formulário...');
    
    // Remover todos os destacamentos
    document.querySelectorAll('.field-changed, .field-unchanged').forEach(el => {
        el.classList.remove('field-changed', 'field-unchanged');
        el.title = '';
    });
    
    // Obter valores padrão
    const defaults = this.getDefaultSettings();
    console.log('📋 Valores padrão:', defaults);
    
    // Forçar atualização de cada campo
    Object.keys(defaults).forEach(key => {
        const fieldId = key.replace(/_/g, '-');
        const element = document.getElementById(fieldId);
        
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = defaults[key] === true || defaults[key] === 'true';
                console.log(`✅ Campo ${fieldId}: ${element.checked}`);
            } else {
                element.value = defaults[key] || '';
                console.log(`✅ Campo ${fieldId}: "${element.value}"`);
            }
            
            // Disparar eventos para atualizar listeners
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            console.warn(`⚠️ Campo não encontrado: ${fieldId}`);
        }
    });
    
    // Aplicar tema com valores padrão
    this.applyThemeSettings();
    
    // Atualizar highlights
    setTimeout(() => this.highlightChangedFields(), 100);
    
    console.log('✅ Formulário atualizado com força!');
};


SuperAdminApp.prototype.extractRealThemeColors = async function() {
    try {
        console.log('🎨 Extraindo cores reais da index.html...');
        
        // Buscar a index.html
        const response = await fetch('/');
        const html = await response.text();
        
        // Extrair cores do CSS inline
        const gradientMatch = html.match(/--gradient-primary:\s*linear-gradient\([^)]+#([a-fA-F0-9]{6})[^)]+#([a-fA-F0-9]{6})[^)]*\)/);
        
        let realColors = {
            primary_color: '#667eea',  // fallback
            secondary_color: '#764ba2'  // fallback
        };
        
        if (gradientMatch) {
            realColors.primary_color = '#' + gradientMatch[1];
            realColors.secondary_color = '#' + gradientMatch[2];
            console.log('✅ Cores extraídas:', realColors);
        }
        
        return realColors;
        
    } catch (error) {
        console.error('❌ Erro ao extrair cores:', error);
        return {
            primary_color: '#667eea',
            secondary_color: '#764ba2'
        };
    }
};

SuperAdminApp.prototype.applyThemeSettings = async function() {
    // Se não há configurações salvas, usar as cores reais da página
    if (!this.settings || !this.settings.primary_color) {
        console.log('🎨 Aplicando cores reais da index.html...');
        const realColors = await this.extractRealThemeColors();
        
        // Atualizar formulário com cores reais
        const primaryField = document.getElementById('primary-color');
        const secondaryField = document.getElementById('secondary-color');
        
        if (primaryField) primaryField.value = realColors.primary_color;
        if (secondaryField) secondaryField.value = realColors.secondary_color;
        
        // Usar cores reais no tema
        this.settings = { ...this.settings, ...realColors };
    }
    
    // Aplicar cores do tema
    const root = document.documentElement;
    if (this.settings.primary_color) {
        root.style.setProperty('--primary-color', this.settings.primary_color);
        console.log('🎨 Cor primária aplicada:', this.settings.primary_color);
    }
    if (this.settings.secondary_color) {
        root.style.setProperty('--secondary-color', this.settings.secondary_color);
        console.log('🎨 Cor secundária aplicada:', this.settings.secondary_color);
    }
    
    // Atualizar título da aba do navegador se estiver no admin
    if (this.settings.site_title && document.title.includes('Admin')) {
        document.title = `Admin - ${this.settings.site_title}`;
    }
};

SuperAdminApp.prototype.processContent = function(contentArray) {
    const content = {};
    if (Array.isArray(contentArray)) {
        contentArray.forEach(item => {
            if (!content[item.section_name]) {
                content[item.section_name] = {};
            }
            content[item.section_name][item.content_key] = item.content_value;
        });
    }
    return content;
};

SuperAdminApp.prototype.getDefaultContent = function() {
    return {
        hero: {
            title: 'Bem-vindo ao Meu Portfólio',
            subtitle: 'Desenvolvedor Full Stack apaixonado por tecnologia',
            cta_primary: 'Ver Projetos',
            cta_secondary: 'Entre em Contato'
        },
        about: {
            title: 'Sobre Mim',
            paragraph1: 'Sou um desenvolvedor apaixonado por criar soluções digitais inovadoras.',
            paragraph2: 'Com experiência em diversas tecnologias modernas.',
            skills: 'JavaScript, React, Node.js, Python'
        },
        contact: {
            title: 'Entre em Contato',
            subtitle: 'Vamos conversar?',
            description: 'Estou sempre aberto a novos projetos e oportunidades.'
        },
        footer: {
            copyright: '© 2024 Meu Portfólio. Todos os direitos reservados.'
        }
    };
};

SuperAdminApp.prototype.updateContentEditor = function() {
    // Preencher formulários de conteúdo com dados carregados
    const setFieldValue = (id, value) => {
        const field = document.getElementById(id);
        if (field) {
            field.value = value || '';
        }
    };

    // Seção Hero
    if (this.content.hero) {
        setFieldValue('hero-title', this.content.hero.title);
        setFieldValue('hero-subtitle', this.content.hero.subtitle);
        setFieldValue('hero-cta-primary', this.content.hero.cta_primary);
        setFieldValue('hero-cta-secondary', this.content.hero.cta_secondary);
    }

    // Seção About
    if (this.content.about) {
        setFieldValue('about-title', this.content.about.title);
        setFieldValue('about-paragraph1', this.content.about.paragraph1);
        setFieldValue('about-paragraph2', this.content.about.paragraph2);
        setFieldValue('about-skills', this.content.about.skills);
    }

    // Seção Contact
    if (this.content.contact) {
        setFieldValue('contact-title', this.content.contact.title);
        setFieldValue('contact-subtitle', this.content.contact.subtitle);
        setFieldValue('contact-description', this.content.contact.description);
    }

    // Seção Footer
    if (this.content.footer) {
        setFieldValue('footer-copyright', this.content.footer.copyright);
    }
};

// Funções para mensagens
SuperAdminApp.prototype.viewMessage = function(messageId) {
    console.log(`Visualizando mensagem ID: ${messageId}`);
    const message = this.messages.find(m => m.id == messageId);
    if (message) {
        // Marcar como lida automaticamente ao visualizar
        if (message.status === 'unread') {
            this.markMessageRead(messageId);
        }
        
        // Mostrar modal com detalhes da mensagem
        alert(`Mensagem de: ${message.name}\nEmail: ${message.email}\nAssunto: ${message.subject || 'Sem assunto'}\n\n${message.message}`);
    }
};

SuperAdminApp.prototype.markMessageRead = async function(messageId) {
    try {
        const response = await fetch(`/api/admin/messages/${messageId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'read' })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        // Atualizar na lista local
        const message = this.messages.find(m => m.id == messageId);
        if (message) {
            message.status = 'read';
            this.updateMessagesList();
            this.updateMessagesPreview();
            this.updateMessagesBadge();
            this.showToast('Mensagem marcada como lida', 'success');
        }
    } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
        this.showToast(`Erro: ${error.message}`, 'error');
    }
};

SuperAdminApp.prototype.deleteMessage = async function(messageId) {
    const message = this.messages.find(m => m.id == messageId);
    if (!message) {
        this.showToast('Mensagem não encontrada', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja excluir a mensagem de "${message.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        try {
            const response = await fetch(`/api/admin/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            // Remover da lista local
            this.messages = this.messages.filter(m => m.id != messageId);
            
            // Atualizar interface
            this.updateMessagesList();
            this.updateMessagesPreview();
            this.updateMessagesBadge();
            
            this.showToast('Mensagem excluída com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao excluir mensagem:', error);
            this.showToast(`Erro ao excluir: ${error.message}`, 'error');
        }
    }
};

// Funções para mídia
SuperAdminApp.prototype.selectMediaItem = function(mediaId) {
    console.log(`Selecionando item de mídia ID: ${mediaId}`);
    const mediaItem = document.querySelector(`[data-id="${mediaId}"]`);
    if (mediaItem) {
        mediaItem.classList.toggle('selected');
        
        if (mediaItem.classList.contains('selected')) {
            this.selectedItems.add(`media-${mediaId}`);
        } else {
            this.selectedItems.delete(`media-${mediaId}`);
        }
        
        this.updateBulkActions();
    }
};

SuperAdminApp.prototype.viewMedia = function(mediaId) {
    const media = this.uploads.find(u => u.id == mediaId);
    if (!media) {
        this.showToast('Arquivo não encontrado', 'error');
        return;
    }

    // Abrir em nova janela/modal
    if (media.mime_type.startsWith('image/')) {
        // Criar modal de preview de imagem
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = media.file_path;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        `;
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    } else {
        // Abrir arquivo em nova aba
        window.open(media.file_path, '_blank');
    }
};

SuperAdminApp.prototype.copyMediaUrl = function(url) {
    navigator.clipboard.writeText(url).then(() => {
        this.showToast('URL copiada para a área de transferência', 'success');
    }).catch(err => {
        console.error('Erro ao copiar URL:', err);
        this.showToast('Erro ao copiar URL', 'error');
    });
};

SuperAdminApp.prototype.deleteMedia = async function(mediaId) {
    const media = this.uploads.find(u => u.id == mediaId);
    if (!media) {
        this.showToast('Arquivo não encontrado', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja excluir "${media.original_name}"?\n\nEsta ação não pode ser desfeita.`)) {
        try {
            this.showToast('Excluindo arquivo...', 'info');
            
            const response = await fetch(`/api/admin/uploads/${mediaId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            // Remover da lista local
            this.uploads = this.uploads.filter(u => u.id != mediaId);
            
            // Atualizar interface
            this.updateMediaGrid();
            this.updateMediaBadge();
            
            this.showToast('Arquivo excluído com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            this.showToast(`Erro ao excluir: ${error.message}`, 'error');
        }
    }
};

SuperAdminApp.prototype.previewSite = function() {
    console.log('Abrindo preview do site');
    window.open('/', '_blank');
};

SuperAdminApp.prototype.saveAllContent = async function() {
    try {
        this.showToast('Salvando conteúdo...', 'info');
        
        // Coletar dados de todas as seções de conteúdo (formato correto para API)
        const contentData = {
            hero: {
                title: { value: document.getElementById('hero-title')?.value || '', type: 'text' },
                subtitle: { value: document.getElementById('hero-subtitle')?.value || '', type: 'text' },
                cta_primary: { value: document.getElementById('hero-cta-primary')?.value || '', type: 'text' },
                cta_secondary: { value: document.getElementById('hero-cta-secondary')?.value || '', type: 'text' }
            },
            about: {
                title: { value: document.getElementById('about-title')?.value || '', type: 'text' },
                paragraph1: { value: document.getElementById('about-paragraph1')?.value || '', type: 'textarea' },
                paragraph2: { value: document.getElementById('about-paragraph2')?.value || '', type: 'textarea' },
                skills: { value: document.getElementById('about-skills')?.value || '', type: 'textarea' }
            },
            contact: {
                title: { value: document.getElementById('contact-title')?.value || '', type: 'text' },
                subtitle: { value: document.getElementById('contact-subtitle')?.value || '', type: 'text' },
                description: { value: document.getElementById('contact-description')?.value || '', type: 'textarea' }
            },
            footer: {
                copyright: { value: document.getElementById('footer-copyright')?.value || '', type: 'text' }
            }
        };

        // Validar campos obrigatórios
        if (!contentData.hero.title.value.trim()) {
            this.showToast('Título principal é obrigatório', 'error');
            return;
        }

        // Salvar cada seção separadamente
        for (const [section, data] of Object.entries(contentData)) {
            const response = await fetch('/api/admin/content', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section: section,
                    content: data
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar seção ${section}: HTTP ${response.status}`);
            }
        }

        // Atualizar conteúdo local
        this.content = { ...this.content, ...contentData };
        
        this.showToast('Conteúdo salvo com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar conteúdo:', error);
        this.showToast(`Erro ao salvar: ${error.message}`, 'error');
    }
};

SuperAdminApp.prototype.bulkDelete = function() {
    const selectedProjects = Array.from(this.selectedItems)
        .filter(item => item.startsWith('project-'))
        .map(item => item.replace('project-', ''));
    
    const selectedMedia = Array.from(this.selectedItems)
        .filter(item => item.startsWith('media-'))
        .map(item => item.replace('media-', ''));
        
    const selectedMessages = Array.from(this.selectedItems)
        .filter(item => item.startsWith('message-'))
        .map(item => item.replace('message-', ''));
    
    if (selectedProjects.length === 0 && selectedMedia.length === 0 && selectedMessages.length === 0) {
        this.showToast('Nenhum item selecionado', 'warning');
        return;
    }
    
    let confirmMessage = 'Tem certeza que deseja excluir os itens selecionados?\n\n';
    
    if (selectedProjects.length > 0) {
        const projectNames = selectedProjects.map(id => {
            const project = this.projects.find(p => p.id == id);
            return project ? project.titulo : `ID ${id}`;
        });
        confirmMessage += `${selectedProjects.length} Projeto(s): ${projectNames.join(', ')}\n`;
    }
    
    if (selectedMedia.length > 0) {
        const mediaNames = selectedMedia.map(id => {
            const media = this.uploads.find(u => u.id == id);
            return media ? media.original_name : `ID ${id}`;
        });
        confirmMessage += `${selectedMedia.length} Arquivo(s): ${mediaNames.join(', ')}\n`;
    }
    
    if (selectedMessages.length > 0) {
        const messageNames = selectedMessages.map(id => {
            const message = this.messages.find(m => m.id == id);
            return message ? `${message.name} (${message.email})` : `ID ${id}`;
        });
        confirmMessage += `${selectedMessages.length} Mensagem(s): ${messageNames.join(', ')}\n`;
    }
    
    confirmMessage += '\nEsta ação não pode ser desfeita.';
    
    if (confirm(confirmMessage)) {
        this.performBulkDeleteMultiType(selectedProjects, selectedMedia, selectedMessages);
    }
};

// Função para executar exclusão em massa de múltiplos tipos
SuperAdminApp.prototype.performBulkDeleteMultiType = async function(projectIds, mediaIds, messageIds) {
    try {
        const totalItems = projectIds.length + mediaIds.length + messageIds.length;
        this.showToast(`Excluindo ${totalItems} item(s)...`, 'info');
        
        const deletePromises = [];
        
        // Adicionar promessas de delete para projetos
        projectIds.forEach(id => {
            deletePromises.push({
                type: 'project',
                id: id,
                promise: fetch(`/api/admin/projetos/${id}`, { method: 'DELETE', credentials: 'include' })
            });
        });
        
        // Adicionar promessas de delete para mídia
        mediaIds.forEach(id => {
            deletePromises.push({
                type: 'media',
                id: id,
                promise: fetch(`/api/admin/upload/${id}`, { method: 'DELETE', credentials: 'include' })
            });
        });
        
        // Adicionar promessas de delete para mensagens
        messageIds.forEach(id => {
            deletePromises.push({
                type: 'message',
                id: id,
                promise: fetch(`/api/admin/messages/${id}`, { method: 'DELETE', credentials: 'include' })
            });
        });
        
        const results = await Promise.allSettled(deletePromises.map(item => item.promise));
        
        let successCount = 0;
        let errorCount = 0;
        const deletedItems = { projects: 0, media: 0, messages: 0 };
        
        results.forEach((result, index) => {
            const item = deletePromises[index];
            if (result.status === 'fulfilled' && result.value.ok) {
                successCount++;
                
                // Remover item da lista local baseado no tipo
                if (item.type === 'project') {
                    this.projects = this.projects.filter(p => p.id != item.id);
                    deletedItems.projects++;
                } else if (item.type === 'media') {
                    this.uploads = this.uploads.filter(u => u.id != item.id);
                    deletedItems.media++;
                } else if (item.type === 'message') {
                    this.messages = this.messages.filter(m => m.id != item.id);
                    deletedItems.messages++;
                }
                
                // Remover da seleção
                this.selectedItems.delete(`${item.type === 'project' ? 'project' : item.type}-${item.id}`);
            } else {
                errorCount++;
                console.error(`Erro ao excluir ${item.type} ${item.id}:`, result.reason);
            }
        });
        
        // Atualizar interface
        this.updateProjectsTable();
        this.updateProjectsBadge();
        this.updateBulkActions();
        
        if (successCount > 0 && errorCount === 0) {
            this.showToast(`${successCount} projetos excluídos com sucesso`, 'success');
        } else if (successCount > 0 && errorCount > 0) {
            this.showToast(`${successCount} projetos excluídos, ${errorCount} com erro`, 'warning');
        } else {
            this.showToast(`Erro ao excluir projetos`, 'error');
        }
        
    } catch (error) {
        console.error('Erro na exclusão em massa:', error);
        this.showToast('Erro na exclusão em massa', 'error');
    }
};

SuperAdminApp.prototype.markAllRead = async function() {
    const unreadMessages = this.messages.filter(m => m.status === 'unread');
    
    if (unreadMessages.length === 0) {
        this.showToast('Não há mensagens não lidas', 'info');
        return;
    }

    if (confirm(`Marcar ${unreadMessages.length} mensagem(s) como lida(s)?`)) {
        try {
            this.showToast(`Marcando ${unreadMessages.length} mensagens como lidas...`, 'info');
            
            const promises = unreadMessages.map(message => 
                fetch(`/api/admin/messages/${message.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'read' })
                })
            );

            const results = await Promise.allSettled(promises);
            
            let successCount = 0;
            let errorCount = 0;

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.ok) {
                    successCount++;
                    // Atualizar na lista local
                    const message = this.messages.find(m => m.id === unreadMessages[index].id);
                    if (message) {
                        message.status = 'read';
                    }
                } else {
                    errorCount++;
                    console.error(`Erro ao marcar mensagem ${unreadMessages[index].id}:`, result.reason);
                }
            });

            // Atualizar interface
            this.updateMessagesList();
            this.updateMessagesPreview();
            this.updateMessagesBadge();

            if (successCount > 0 && errorCount === 0) {
                this.showToast(`${successCount} mensagens marcadas como lidas`, 'success');
            } else if (successCount > 0 && errorCount > 0) {
                this.showToast(`${successCount} mensagens marcadas, ${errorCount} com erro`, 'warning');
            } else {
                this.showToast('Erro ao marcar mensagens como lidas', 'error');
            }

        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
            this.showToast('Erro ao marcar mensagens como lidas', 'error');
        }
    }
};

SuperAdminApp.prototype.deleteSelected = function() {
    console.log('Excluindo mensagens selecionadas');
    this.showToast('Funcionalidade em desenvolvimento', 'info');
};

SuperAdminApp.prototype.exportAnalytics = function() {
    console.log('Exportando analytics');
    this.showToast('Funcionalidade em desenvolvimento', 'info');
};

SuperAdminApp.prototype.refreshAnalytics = function() {
    console.log('Atualizando analytics');
    this.loadAnalytics();
    this.showToast('Analytics atualizado', 'success');
};

SuperAdminApp.prototype.resetSettings = function() {
    if (confirm('⚠️ RESET DE CONFIGURAÇÕES\n\nIsso irá restaurar TODAS as configurações aos valores padrão reais da index.html.\n\nEsta ação não pode ser desfeita. Confirma?')) {
        this.performFullReset();
    }
};

SuperAdminApp.prototype.performFullReset = async function() {
    try {
        this.showToast('Restaurando configurações padrão...', 'info');
        
        console.log('🔄 Iniciando reset completo...');
        
        const response = await fetch('/api/admin/settings/reset', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Reset no backend concluído:', result);

        // Limpar cache local
        this.settings = null;
        
        // Forçar recarregamento completo das configurações
        console.log('🔄 Recarregando configurações...');
        await this.loadSettings();
        
        // Forçar atualização visual
        this.forceUpdateForm();
        
        console.log('✅ Reset completo finalizado');
        this.showToast('✅ Configurações restauradas aos valores padrão!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao restaurar configurações:', error);
        this.showToast(`❌ Erro ao restaurar: ${error.message}`, 'error');
    }
};

SuperAdminApp.prototype.performSmartReset = function() {
    try {
        this.showToast('Aplicando reset inteligente...', 'info');
        
        const defaults = this.getDefaultSettings();
        const detection = this.detectSettingsChanges();
        let resetsApplied = 0;
        
        // Resetar apenas campos vazios ou com valores inválidos
        Object.keys(defaults).forEach(key => {
            const fieldId = key.replace(/_/g, '-');
            const element = document.getElementById(fieldId);
            
            if (element) {
                let shouldReset = false;
                
                if (element.type === 'checkbox') {
                    // Para checkboxes, não resetamos automaticamente
                } else {
                    const currentValue = element.value?.trim();
                    
                    // Resetar se estiver vazio ou for um valor claramente problemático
                    if (!currentValue || 
                        currentValue === 'undefined' || 
                        currentValue === 'null' ||
                        (key === 'main_email' && !currentValue.includes('@'))) {
                        shouldReset = true;
                    }
                }
                
                if (shouldReset) {
                    element.value = defaults[key];
                    resetsApplied++;
                }
            }
        });
        
        if (resetsApplied > 0) {
            this.showToast(`${resetsApplied} campo(s) resetado(s) com valores padrão`, 'success');
            // Salvar as alterações automaticamente
            setTimeout(() => this.saveSettings(false), 1000);
        } else {
            this.showToast('Nenhum campo precisou ser resetado', 'info');
        }
        
    } catch (error) {
        console.error('Erro no reset inteligente:', error);
        this.showToast(`Erro no reset: ${error.message}`, 'error');
    }
};

SuperAdminApp.prototype.saveSettings = async function(saveOnlyChanges = true) {
    try {
        this.showToast('Salvando configurações...', 'info');
        
        // Detectar mudanças
        const detection = this.detectSettingsChanges();
        
        if (saveOnlyChanges && !detection.hasChanges) {
            this.showToast('Nenhuma alteração foi detectada', 'info');
            return;
        }
        
        // Decidir quais dados salvar
        const settingsData = saveOnlyChanges 
            ? Object.keys(detection.changes).reduce((acc, key) => {
                acc[key] = detection.changes[key].new;
                return acc;
            }, {})
            : detection.currentData;

        // Validar campos obrigatórios (apenas se existirem nos dados)
        if (settingsData.site_title !== undefined && !settingsData.site_title.trim()) {
            this.showToast('Título do site não pode estar vazio', 'error');
            return;
        }

        if (settingsData.main_email !== undefined) {
            if (!settingsData.main_email.trim()) {
                this.showToast('Email principal não pode estar vazio', 'error');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(settingsData.main_email)) {
                this.showToast('Email principal deve ter um formato válido', 'error');
                return;
            }
        }

        const response = await fetch('/api/admin/settings', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Atualizar configurações locais
        this.settings = { ...this.settings, ...settingsData };
        
        // Aplicar configurações de aparência imediatamente
        this.applyThemeSettings();
        
        this.showToast('Configurações salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        this.showToast(`Erro ao salvar: ${error.message}`, 'error');
    }
};

SuperAdminApp.prototype.closeModal = function(modalId) {
    console.log(`Fechando modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
};

SuperAdminApp.prototype.hideToast = function() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
};

// Método para destruir gráficos existentes
SuperAdminApp.prototype.destroyExistingCharts = function() {
    try {
        // Destruir gráfico de visitas
        if (this.visitsChart && typeof this.visitsChart.destroy === 'function') {
            this.visitsChart.destroy();
            this.visitsChart = null;
        }
        
        // Destruir gráfico de dispositivos
        if (this.deviceChart && typeof this.deviceChart.destroy === 'function') {
            this.deviceChart.destroy();
            this.deviceChart = null;
        }
        
        // Destruir gráfico de navegadores
        if (this.browserChart && typeof this.browserChart.destroy === 'function') {
            this.browserChart.destroy();
            this.browserChart = null;
        }
        
        // Destruir todos os gráficos usando Chart.js global registry
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.values(Chart.instances).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    try {
                        chart.destroy();
                    } catch (e) {
                        console.warn('Erro ao destruir gráfico:', e);
                    }
                }
            });
        }
        
        console.log('Gráficos existentes destruídos');
    } catch (error) {
        console.warn('Erro ao destruir gráficos:', error);
    }
};

SuperAdminApp.prototype.loadChartJS = async function() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Falha ao carregar Chart.js'));
        document.head.appendChild(script);
    });
};

SuperAdminApp.prototype.resizeCharts = function() {
    // Evitar redimensionamento excessivo
    if (this.resizingCharts) return;
    this.resizingCharts = true;
    
    if (typeof Chart === 'undefined') {
        this.resizingCharts = false;
        return;
    }
    
    // Redimensionar charts específicos se existirem
    const resizeTask = () => {
        try {
            let chartsResized = 0;
            
            if (this.visitsChart && typeof this.visitsChart.resize === 'function') {
                this.visitsChart.resize();
                chartsResized++;
            }
            if (this.deviceChart && typeof this.deviceChart.resize === 'function') {
                this.deviceChart.resize();
                chartsResized++;
            }
            if (this.browserChart && typeof this.browserChart.resize === 'function') {
                this.browserChart.resize();
                chartsResized++;
            }
            
            if (chartsResized > 0) {
                console.log(`${chartsResized} gráficos redimensionados`);
            }
        } catch (error) {
            console.warn('Erro ao redimensionar gráficos:', error);
        } finally {
            this.resizingCharts = false;
        }
    };
    
    // Usar requestIdleCallback com timeout para evitar loops
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(resizeTask, { timeout: 500 });
    } else {
        setTimeout(() => {
            resizeTask();
        }, 100);
    }
};

SuperAdminApp.prototype.updateContentEditor = function(content) {
    if (!content || typeof content !== 'object') {
        console.warn('Dados de conteúdo indisponíveis, usando valores padrão');
        // Criar estrutura padrão
        content = {
            hero: { 
                title: { value: 'Bem-vindo ao Meu Portfólio' },
                subtitle: { value: 'Desenvolvedor fullstack disponível para projetos' }
            },
            about: { 
                title: { value: 'Sobre Mim' },
                paragraph1: { value: 'Desenvolvedor apaixonado por tecnologia.' }
            }
        };
    }
    
    console.log('Conteúdo processado:', content);
    // Atualizar formulários de conteúdo no admin panel
    this.populateContentForms(content);
};

// Função duplicada removida - usar apenas a função principal updateSettingsForm

SuperAdminApp.prototype.updateMediaBadge = function() {
    const badge = document.querySelector('.media-count');
    if (badge && this.uploads) {
        badge.textContent = this.uploads.length || 0;
    }
};

SuperAdminApp.prototype.updateMessagesBadge = function() {
    const badge = document.querySelector('.messages-count');
    if (badge && this.messages) {
        badge.textContent = this.messages.unreadCount || 0;
    }
};

SuperAdminApp.prototype.updateAnalytics = function(analytics) {
    if (!analytics || typeof analytics !== 'object') {
        console.warn('Dados de analytics indisponíveis, usando valores padrão');
        analytics = {
            summary: { today: 0, week: 0, month: 0 },
            dailyVisits: [],
            deviceStats: [],
            browserStats: [],
            popularPages: []
        };
    }
    
    console.log('Analytics processados:', analytics);
    
    // Atualizar dashboard de analytics
    const todayElement = document.querySelector('.visits-today');
    const weekElement = document.querySelector('.visits-week');
    const monthElement = document.querySelector('.visits-month');
    
    if (todayElement) todayElement.textContent = analytics.summary?.today || 0;
    if (weekElement) weekElement.textContent = analytics.summary?.week || 0;
    if (monthElement) monthElement.textContent = analytics.summary?.month || 0;
    
    // Armazenar para uso nos gráficos
    this.analytics = analytics;
};

// Métodos auxiliares para popular formulários
SuperAdminApp.prototype.populateContentForms = function(content) {
    // Popular formulários de conteúdo quando elementos existirem no DOM
    requestIdleCallback(() => {
        Object.keys(content).forEach(section => {
            const sectionData = content[section];
            if (sectionData && typeof sectionData === 'object') {
                Object.keys(sectionData).forEach(key => {
                    const input = document.querySelector(`#${section}_${key}`);
                    if (input && sectionData[key]?.value) {
                        input.value = sectionData[key].value;
                    }
                });
            }
        });
    });
};

SuperAdminApp.prototype.populateSettingsForms = function(settings) {
    // Popular formulários de configurações quando elementos existirem no DOM
    requestIdleCallback(() => {
        Object.keys(settings).forEach(key => {
            const input = document.querySelector(`#setting_${key}`);
            if (input && settings[key]?.value) {
                input.value = settings[key].value;
            }
        });
    });
};

// Métodos de Tooltip
SuperAdminApp.prototype.showTooltip = function(element, text) {
    if (!text || !element) return;
    
    // Remove tooltip existente
    this.hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'admin-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    
    // Fade in
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
    });
    
    this.currentTooltip = tooltip;
};

SuperAdminApp.prototype.hideTooltip = function() {
    if (this.currentTooltip) {
        this.currentTooltip.remove();
        this.currentTooltip = null;
    }
};

// Métodos de Navegação
SuperAdminApp.prototype.loadSectionData = function(section) {
    console.log(`Carregando dados da seção: ${section}`);
    
    // Carregar dados específicos da seção
    switch(section) {
        case 'dashboard':
            this.loadAnalytics().catch(console.warn);
            break;
        case 'projects':
            this.loadProjects().catch(console.warn);
            break;
        case 'messages':
            this.loadMessages().catch(console.warn);
            break;
        case 'media':
            this.loadUploads().catch(console.warn);
            break;
        case 'settings':
            this.loadSettings().catch(console.warn);
            break;
        case 'content':
            this.loadContent().catch(console.warn);
            break;
        case 'analytics':
        case 'dashboard':
            this.loadAnalytics().catch(console.warn);
            break;
        default:
            console.log(`Seção desconhecida: ${section}`);
    }
};

SuperAdminApp.prototype.updateLastActivity = function() {
    this.lastActivity = new Date().toISOString();
    const element = document.querySelector('.last-activity');
    if (element) {
        element.textContent = 'Agora mesmo';
    }
};

// Métodos de UI
SuperAdminApp.prototype.updateMediaPagination = function() {
    console.log('Atualizando paginação de mídia');
    
    if (!this.uploads || !this.uploads.uploads) return;
    
    const pagination = this.uploads.pagination;
    const paginationElement = document.querySelector('.media-pagination');
    
    if (paginationElement && pagination) {
        paginationElement.innerHTML = `
            <span>Página ${pagination.page} de ${pagination.pages}</span>
            <span>${this.uploads.uploads.length} itens</span>
        `;
    }
};

SuperAdminApp.prototype.updateAnalyticsCharts = function() {
    // Controle mais robusto para evitar recreação desnecessária
    const analyticsHash = this.analytics ? JSON.stringify(this.analytics) : 'null';
    
    if (this.chartsInitialized && this.lastAnalyticsHash === analyticsHash) {
        console.log('Gráficos já atualizados, pulando recriação');
        return;
    }
    
    console.log('Atualizando gráficos de analytics');
    
    if (!this.analytics || typeof this.analytics !== 'object') {
        console.warn('Dados de analytics não disponíveis para gráficos');
        this.showChartsPlaceholder();
        this.chartsInitialized = true;
        this.lastAnalyticsHash = analyticsHash;
        return;
    }
    
    // Garantir que Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não disponível, aguardando carregamento...');
        this.loadChartJS().then(() => {
            // Tentar novamente após carregar Chart.js
            this.updateAnalyticsCharts();
        }).catch(error => {
            console.error('Erro ao carregar Chart.js:', error);
            this.showChartsPlaceholder();
        });
        return;
    }
    
    // Usar requestIdleCallback para melhor performance
    const updateChartsTask = () => {
        try {
            // Destruir gráficos existentes antes de recriar
            this.destroyExistingCharts();
            
            // Criar novos gráficos com dados validados
            if (this.analytics.dailyVisits && Array.isArray(this.analytics.dailyVisits) && this.analytics.dailyVisits.length > 0) {
                this.createVisitsChart();
            } else {
                this.showChartPlaceholder('visitsChart', 'Sem dados de visitas disponíveis');
            }
            
            if (this.analytics.deviceStats && Array.isArray(this.analytics.deviceStats) && this.analytics.deviceStats.length > 0) {
                this.createDeviceChart();
            } else {
                this.showChartPlaceholder('devicesChart', 'Sem dados de dispositivos disponíveis');
            }
            
            if (this.analytics.browserStats && Array.isArray(this.analytics.browserStats) && this.analytics.browserStats.length > 0) {
                this.createBrowserChart();
            } else {
                this.showChartPlaceholder('browserChart', 'Sem dados de navegadores disponíveis');
            }
            
            // Marcar como inicializados
            this.chartsInitialized = true;
            this.lastAnalyticsHash = analyticsHash;
            
            console.log('Gráficos atualizados com sucesso');
            
        } catch (error) {
            console.warn('Erro ao criar gráficos:', error);
            this.showChartsPlaceholder();
            this.chartsInitialized = true;
            this.lastAnalyticsHash = analyticsHash;
        }
    };
    
    // Usar requestIdleCallback se disponível, senão usar setTimeout
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(updateChartsTask, { timeout: 1000 });
    } else {
        setTimeout(updateChartsTask, 100);
    }
};

SuperAdminApp.prototype.showChartPlaceholder = function(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const container = canvas.parentElement;
        
        // Limpar placeholders existentes
        const existingPlaceholder = container?.querySelector('.chart-placeholder');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        
        if (container) {
            canvas.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'chart-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-chart-bar" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666;">${message}</p>
            `;
            placeholder.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 300px;
                text-align: center;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            `;
            
            // Garantir que o container tenha position relative
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            
            container.appendChild(placeholder);
        }
    }
};

SuperAdminApp.prototype.showChartsPlaceholder = function() {
    ['visitsChart', 'deviceChart', 'browserChart'].forEach(chartId => {
        this.showChartPlaceholder(chartId, 'Dados indisponíveis');
    });
};

SuperAdminApp.prototype.createVisitsChart = function() {
    const ctx = document.getElementById('visitsChart');
    if (!ctx || !this.analytics?.dailyVisits) return;
    
    // Limpar placeholders
    const container = ctx.parentElement;
    const placeholder = container?.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Mostrar canvas
    ctx.style.display = 'block';
    
    // Destruir chart existente
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    try {
        this.visitsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analytics.dailyVisits.map(d => new Date(d.date).toLocaleDateString('pt-BR')),
                datasets: [{
                    label: 'Visitas',
                    data: this.analytics.dailyVisits.map(d => d.visits),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                interaction: {
                    intersect: false
                },
                elements: {
                    point: {
                        radius: 3
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Erro ao criar gráfico de visitas:', error);
    }
};

SuperAdminApp.prototype.createDeviceChart = function() {
    const ctx = document.getElementById('deviceChart');
    if (!ctx || !this.analytics?.deviceStats) return;
    
    // Limpar placeholders e mostrar canvas
    const container = ctx.parentElement;
    const placeholder = container?.querySelector('.chart-placeholder');
    if (placeholder) placeholder.remove();
    ctx.style.display = 'block';
    
    // Destruir chart existente
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    try {
        this.deviceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.analytics.deviceStats.map(d => d.device_type),
                datasets: [{
                    data: this.analytics.deviceStats.map(d => d.count),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                }
            }
        });
    } catch (error) {
        console.warn('Erro ao criar gráfico de dispositivos:', error);
    }
};

SuperAdminApp.prototype.createBrowserChart = function() {
    const ctx = document.getElementById('browserChart');
    if (!ctx || !this.analytics?.browserStats) return;
    
    // Limpar placeholders e mostrar canvas
    const container = ctx.parentElement;
    const placeholder = container?.querySelector('.chart-placeholder');
    if (placeholder) placeholder.remove();
    ctx.style.display = 'block';
    
    // Destruir chart existente
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    try {
        this.browserChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.analytics.browserStats.map(b => b.browser),
                datasets: [{
                    label: 'Usuários',
                    data: this.analytics.browserStats.map(b => b.count),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Erro ao criar gráfico de navegadores:', error);
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('Erro não capturado:', e.error);
    if (adminApp) {
        adminApp.showToast('Ocorreu um erro inesperado', 'error');
    }
});

// Adicionar métodos que estavam faltando
SuperAdminApp.prototype.switchContentSection = function(section) {
    console.log(`Mudando para seção de conteúdo: ${section}`);
    
    // Remover classe active de todas as seções de conteúdo
    document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar active na seção selecionada
    const selectedSection = document.querySelector(`[data-section="${section}"]`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Mostrar o formulário correspondente
    document.querySelectorAll('.content-form').forEach(form => {
        form.style.display = 'none';
    });
    
    const targetForm = document.getElementById(`content-${section}`);
    if (targetForm) {
        targetForm.style.display = 'block';
    }
    
    // Carregar dados específicos da seção se necessário
    this.loadContentSection(section);
};

SuperAdminApp.prototype.switchSettingsTab = function(tab) {
    console.log(`Mudando para aba de configurações: ${tab}`);
    
    // Remover classe active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar active na aba selecionada
    const selectedTab = document.querySelector(`[data-tab="${tab}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Mostrar o conteúdo correspondente
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const targetContent = document.getElementById(`tab-${tab}`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
};

SuperAdminApp.prototype.loadContentSection = function(section) {
    // Método para carregar dados específicos de uma seção de conteúdo
    console.log(`Carregando dados da seção de conteúdo: ${section}`);
    
    // Aqui você pode adicionar lógica específica para cada seção
    switch(section) {
        case 'hero':
            // Carregar dados da seção hero
            break;
        case 'about':
            // Carregar dados da seção about
            break;
        case 'contact':
            // Carregar dados da seção contact
            break;
        case 'footer':
            // Carregar dados do footer
            break;
        default:
            console.log(`Seção de conteúdo desconhecida: ${section}`);
    }
};

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
    if (adminApp) {
        adminApp.showToast('Erro de conectividade', 'error');
    }
});

// Performance monitoring
if ('performance' in window && 'measure' in window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Página carregada em ${loadTime}ms`);
        }, 0);
    });
}
