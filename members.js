document.addEventListener('DOMContentLoaded', function() {
    const loginFormContainer = document.getElementById('login-form');
    const registerFormContainer = document.getElementById('register-form');
    const resetFormContainer = document.getElementById('reset-password-form');
    const loginForm = loginFormContainer ? loginFormContainer.querySelector('form') : null;
    const registerForm = registerFormContainer ? registerFormContainer.querySelector('form') : null;
    const resetForm = resetFormContainer ? resetFormContainer.querySelector('form') : null;
    const memberContent = document.getElementById('member-content');

    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (error) {
        users = [];
        localStorage.removeItem('users');
    }
    
    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showMemberContent();
                alert('Přihlášení úspěšné!');
            } else {
                alert('Nesprávný email nebo heslo.');
            }
        });
    }

    // Register Handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Hesla se neshodují!');
                return;
            }
            
            if (users.some(u => u.email === email)) {
                alert('Uživatel s tímto emailem již existuje.');
                return;
            }
            
            const newUser = {
                email,
                password,
                joinDate: new Date().toISOString(),
                membershipLevel: 'basic'
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registrace úspěšná! Nyní se můžete přihlásit.');
            showLoginForm();
        });
    }

    // Reset Password Handler
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            
            const user = users.find(u => u.email === email);
            if (user) {
                // V reálné aplikaci by zde byl kód pro odeslání emailu
                alert('Pokud účet existuje, poslali jsme vám email s instrukcemi pro obnovení hesla.');
            } else {
                alert('Pokud účet existuje, poslali jsme vám email s instrukcemi pro obnovení hesla.');
            }
        });
    }

    // Check if user is logged in
    function checkAuth() {
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            localStorage.removeItem('currentUser');
        }

        if (currentUser) {
            showMemberContent();
        }
    }

    // Show member content
    function showMemberContent() {
        if (loginFormContainer) loginFormContainer.style.display = 'none';
        if (registerFormContainer) registerFormContainer.style.display = 'none';
        if (resetFormContainer) resetFormContainer.style.display = 'none';
        if (memberContent) {
            memberContent.style.display = 'block';
            loadMemberContent();
        }
    }

    // Load member content
    function loadMemberContent() {
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            localStorage.removeItem('currentUser');
        }

        if (memberContent && currentUser) {
            memberContent.innerHTML = '';

            const title = document.createElement('h2');
            const email = document.createElement('p');
            const membership = document.createElement('p');
            const resources = document.createElement('div');
            const videoSection = document.createElement('div');
            const ebookSection = document.createElement('div');
            const videoTitle = document.createElement('h3');
            const ebookTitle = document.createElement('h3');
            const logoutButton = document.createElement('button');

            title.textContent = 'Vítejte v členské sekci!';
            email.textContent = `Email: ${currentUser.email}`;
            membership.textContent = `Členství: ${currentUser.membershipLevel}`;
            resources.className = 'member-resources';
            videoSection.className = 'video-section';
            ebookSection.className = 'ebook-section';
            videoTitle.textContent = 'Video lekce';
            ebookTitle.textContent = 'E-booky ke stažení';
            logoutButton.className = 'submit-btn';
            logoutButton.type = 'button';
            logoutButton.textContent = 'Odhlásit se';
            logoutButton.addEventListener('click', () => window.logout());

            videoSection.appendChild(videoTitle);
            ebookSection.appendChild(ebookTitle);
            resources.append(videoSection, ebookSection);
            memberContent.append(title, email, membership, resources, logoutButton);
        }
    }

    // Logout function
    window.logout = function() {
        localStorage.removeItem('currentUser');
        location.reload();
    };

    // Initialize
    checkAuth();
});
