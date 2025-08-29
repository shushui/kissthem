// Global variables
let currentUser = null;
let selectedFile = null;
let originalImageData = null;
let oauthClientId = null;

// DOM elements
const authSection = document.getElementById('authSection');
const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

const welcomeSection = document.getElementById('welcomeSection');
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultSection = document.getElementById('resultSection');

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const imagePreview = document.getElementById('imagePreview');
const fileName = document.getElementById('fileName');
const processBtn = document.getElementById('processBtn');

const progressFill = document.getElementById('progressFill');
const originalImage = document.getElementById('originalImage');
const kissedImage = document.getElementById('kissedImage');
const downloadBtn = document.getElementById('downloadBtn');
const newPhotoBtn = document.getElementById('newPhotoBtn');

const toastContainer = document.getElementById('toastContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize the application
async function initializeApp() {
    try {
        // Get OAuth client ID from backend
        const response = await fetch('/api/oauth-client-id');
        const data = await response.json();
        oauthClientId = data.clientId;
        
        // Wait for Google OAuth library to load
        if (typeof google === 'undefined' || !google.accounts) {
            console.log('Waiting for Google OAuth library to load...');
            setTimeout(initializeApp, 100);
            return;
        }
        
        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: oauthClientId,
            callback: handleCredentialResponse
        });
        
        google.accounts.id.renderButton(loginBtn, {
            theme: 'outline',
            size: 'large',
            type: 'standard'
        });
        
        // Show the login button and hide fallback
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('loginFallback').style.display = 'none';
        
        console.log('Google OAuth initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showToast('Failed to initialize application. Please refresh the page.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // File upload events
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Process button
    processBtn.addEventListener('click', processImage);
    
    // Result actions
    downloadBtn.addEventListener('click', downloadImage);
    newPhotoBtn.addEventListener('click', resetToUpload);
    
    // Logout
    logoutBtn.addEventListener('click', logout);
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('googleToken');
    if (token) {
        // Verify token and get user info
        verifyToken(token);
    }
}

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    currentUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        token: credential
    };
    
    localStorage.setItem('googleToken', credential);
    localStorage.setItem('userInfo', JSON.stringify(currentUser));
    
    updateUIForAuthenticatedUser();
    showToast('Successfully signed in!', 'success');
}

// Verify Google token
async function verifyToken(token) {
    try {
        // In a real app, you'd verify the token with your backend
        // For now, we'll just check if we have stored user info
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            updateUIForAuthenticatedUser();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        logout();
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userAvatar.src = currentUser.picture;
        userName.textContent = currentUser.name;
        
        // Show upload section
        welcomeSection.style.display = 'none';
        uploadSection.style.display = 'block';
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userInfo');
    
    // Reset UI
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    welcomeSection.style.display = 'block';
    uploadSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    // Reset file selection
    resetFileSelection();
    
    showToast('Successfully logged out', 'info');
}

// File handling functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processSelectedFile(file);
    } else {
        showToast('Please select a valid image file', 'error');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processSelectedFile(file);
        } else {
            showToast('Please select a valid image file', 'error');
        }
    }
}

function processSelectedFile(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        originalImageData = e.target.result;
        fileInfo.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function resetFileSelection() {
    selectedFile = null;
    originalImageData = null;
    fileInfo.style.display = 'none';
    imagePreview.src = '';
    fileName.textContent = '';
    fileInput.value = '';
}

// Process image with AI
async function processImage() {
    if (!selectedFile) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Please sign in to process images', 'error');
        return;
    }
    
    // Show processing section
    uploadSection.style.display = 'none';
    processingSection.style.display = 'block';
    
    try {
        // Simulate progress
        simulateProgress();
        
        // Process with Gemini API
        const kissedImageData = await processWithGemini(selectedFile);
        
        // Show results
        showResults(kissedImageData);
        
    } catch (error) {
        console.error('Processing failed:', error);
        showToast('Failed to process image. Please try again.', 'error');
        
        // Return to upload section
        processingSection.style.display = 'none';
        uploadSection.style.display = 'block';
    }
}

// Simulate progress bar
function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
    }, 200);
}

// Process image with Gemini API via backend
async function processWithGemini(imageFile) {
    try {
        // Convert file to base64
        const base64Image = await fileToBase64(imageFile);
        
        // Send to backend API
        const response = await fetch('/api/process-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                image: base64Image,
                prompt: "Use Gemini 2.5 Flash Image Preview to generate a completely new version of this photo with a cute kiss added. Create a realistic image that shows the person with a kiss mark or kiss effect. Make it look natural and adorable."
            })
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return data.processedImage;
        } else {
            throw new Error(data.error || 'Failed to process image');
        }

    } catch (error) {
        console.error('Image processing failed:', error);
        throw new Error('Failed to process image. Please try again.');
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Show results
function showResults(kissedImageData) {
    processingSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    originalImage.src = originalImageData;
    kissedImage.src = kissedImageData;
}

// Download processed image
function downloadImage() {
    const link = document.createElement('a');
    link.download = `kissed_${selectedFile.name}`;
    link.href = kissedImage.src;
    link.click();
    
    showToast('Image downloaded successfully!', 'success');
}

// Reset to upload section
function resetToUpload() {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    resetFileSelection();
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = getToastIcon(type);
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'info':
        default:
            return 'fas fa-info-circle';
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('An unexpected error occurred', 'error');
}); 