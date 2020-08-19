/**
 * Script for login.ejs
 */
// Validation Regexes.
var validUsername = /^[a-zA-Z0-9_]{1,16}$/;
var basicEmail = /^\S+@\S+\.\S+$/;
//const validEmail          = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
// Login Elements
var loginCancelContainer = document.getElementById('loginCancelContainer');
var loginCancelButton = document.getElementById('loginCancelButton');
var loginEmailError = document.getElementById('loginEmailError');
var loginUsername = document.getElementById('loginUsername');
var loginPasswordError = document.getElementById('loginPasswordError');
var loginPassword = document.getElementById('loginPassword');
var checkmarkContainer = document.getElementById('checkmarkContainer');
var loginRememberOption = document.getElementById('loginRememberOption');
var loginButton = document.getElementById('loginButton');
var loginForm = document.getElementById('loginForm');
// Control variables.
var lu = false, lp = false;
var loggerLogin = LoggerUtil('%c[Login]', 'color: #000668; font-weight: bold');
/**
 * Show a login error.
 *
 * @param {HTMLElement} element The element on which to display the error.
 * @param {string} value The error text.
 */
function showError(element, value) {
    element.innerHTML = value;
    element.style.opacity = 1;
}
/**
 * Shake a login error to add emphasis.
 *
 * @param {HTMLElement} element The element to shake.
 */
function shakeError(element) {
    if (element.style.opacity == 1) {
        element.classList.remove('shake');
        void element.offsetWidth;
        element.classList.add('shake');
    }
}
/**
 * Validate that an email field is neither empty nor invalid.
 *
 * @param {string} value The email value.
 */
function validateEmail(value) {
    if (value) {
        if (!basicEmail.test(value) && !validUsername.test(value)) {
            showError(loginEmailError, Lang.queryJS('login.error.invalidValue'));
            loginDisabled(true);
            lu = false;
        }
        else {
            loginEmailError.style.opacity = 0;
            lu = true;
            if (lp) {
                loginDisabled(false);
            }
        }
    }
    else {
        lu = false;
        showError(loginEmailError, Lang.queryJS('login.error.requiredValue'));
        loginDisabled(true);
    }
}
/**
 * Validate that the password field is not empty.
 *
 * @param {string} value The password value.
 */
function validatePassword(value) {
    if (value) {
        loginPasswordError.style.opacity = 0;
        lp = true;
        if (lu) {
            loginDisabled(false);
        }
    }
    else {
        lp = false;
        showError(loginPasswordError, Lang.queryJS('login.error.invalidValue'));
        loginDisabled(true);
    }
}
// Emphasize errors with shake when focus is lost.
loginUsername.addEventListener('focusout', function (e) {
    validateEmail(e.target.value);
    shakeError(loginEmailError);
});
loginPassword.addEventListener('focusout', function (e) {
    validatePassword(e.target.value);
    shakeError(loginPasswordError);
});
// Validate input for each field.
loginUsername.addEventListener('input', function (e) {
    validateEmail(e.target.value);
});
loginPassword.addEventListener('input', function (e) {
    validatePassword(e.target.value);
});
/**
 * Enable or disable the login button.
 *
 * @param {boolean} v True to enable, false to disable.
 */
function loginDisabled(v) {
    if (loginButton.disabled !== v) {
        loginButton.disabled = v;
    }
}
/**
 * Enable or disable loading elements.
 *
 * @param {boolean} v True to enable, false to disable.
 */
function loginLoading(v) {
    if (v) {
        loginButton.setAttribute('loading', v);
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'));
    }
    else {
        loginButton.removeAttribute('loading');
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'));
    }
}
/**
 * Enable or disable login form.
 *
 * @param {boolean} v True to enable, false to disable.
 */
function formDisabled(v) {
    loginDisabled(v);
    loginCancelButton.disabled = v;
    loginUsername.disabled = v;
    loginPassword.disabled = v;
    if (v) {
        checkmarkContainer.setAttribute('disabled', v);
    }
    else {
        checkmarkContainer.removeAttribute('disabled');
    }
    loginRememberOption.disabled = v;
}
/**
 * Parses an error and returns a user-friendly title and description
 * for our error overlay.
 *
 * @param {Error | {cause: string, error: string, errorMessage: string}} err A Node.js
 * error or Mojang error response.
 */
function resolveError(err) {
    // Mojang Response => err.cause | err.error | err.errorMessage
    // Node error => err.code | err.message
    if (err.cause != null && err.cause === 'UserMigratedException') {
        return {
            title: Lang.queryJS('login.error.userMigrated.title'),
            desc: Lang.queryJS('login.error.userMigrated.desc')
        };
    }
    else {
        if (err.error != null) {
            if (err.error === 'ForbiddenOperationException') {
                if (err.errorMessage != null) {
                    if (err.errorMessage === 'Invalid credentials. Invalid username or password.') {
                        return {
                            title: Lang.queryJS('login.error.invalidCredentials.title'),
                            desc: Lang.queryJS('login.error.invalidCredentials.desc')
                        };
                    }
                    else if (err.errorMessage === 'Invalid credentials.') {
                        return {
                            title: Lang.queryJS('login.error.rateLimit.title'),
                            desc: Lang.queryJS('login.error.rateLimit.desc')
                        };
                    }
                }
            }
        }
        else {
            // Request errors (from Node).
            if (err.code != null) {
                if (err.code === 'ENOENT') {
                    // No Internet.
                    return {
                        title: Lang.queryJS('login.error.noInternet.title'),
                        desc: Lang.queryJS('login.error.noInternet.desc')
                    };
                }
                else if (err.code === 'ENOTFOUND') {
                    // Could not reach server.
                    return {
                        title: Lang.queryJS('login.error.authDown.title'),
                        desc: Lang.queryJS('login.error.authDown.desc')
                    };
                }
            }
        }
    }
    if (err.message != null) {
        if (err.message === 'NotPaidAccount') {
            return {
                title: Lang.queryJS('login.error.notPaid.title'),
                desc: Lang.queryJS('login.error.notPaid.desc')
            };
        }
        else {
            // Unknown error with request.
            return {
                title: Lang.queryJS('login.error.unknown.title'),
                desc: err.message
            };
        }
    }
    else {
        // Unknown Mojang error.
        return {
            title: err.error,
            desc: err.errorMessage
        };
    }
}
var loginViewOnSuccess = VIEWS.landing;
var loginViewOnCancel = VIEWS.settings;
var loginViewCancelHandler;
function loginCancelEnabled(val) {
    if (val) {
        $(loginCancelContainer).show();
    }
    else {
        $(loginCancelContainer).hide();
    }
}
loginCancelButton.onclick = function (e) {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, function () {
        loginUsername.value = '';
        loginPassword.value = '';
        loginCancelEnabled(false);
        if (loginViewCancelHandler != null) {
            loginViewCancelHandler();
            loginViewCancelHandler = null;
        }
    });
};
// Disable default form behavior.
loginForm.onsubmit = function () { return false; };
// Bind login button behavior.
loginButton.addEventListener('click', function () {
    // Disable form.
    formDisabled(true);
    // Show loading stuff.
    loginLoading(true);
    AuthManager.addAccount(loginUsername.value, loginPassword.value).then(function (value) {
        updateSelectedAccount(value);
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'));
        $('.circle-loader').toggleClass('load-complete');
        $('.checkmark').toggle();
        setTimeout(function () {
            switchView(VIEWS.login, loginViewOnSuccess, 500, 500, function () {
                // Temporary workaround
                if (loginViewOnSuccess === VIEWS.settings) {
                    prepareSettings();
                }
                loginViewOnSuccess = VIEWS.landing; // Reset this for good measure.
                loginCancelEnabled(false); // Reset this for good measure.
                loginViewCancelHandler = null; // Reset this for good measure.
                loginUsername.value = '';
                loginPassword.value = '';
                $('.circle-loader').toggleClass('load-complete');
                $('.checkmark').toggle();
                loginLoading(false);
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'));
                formDisabled(false);
            });
        }, 1000);
    }).catch(function (err) {
        loginLoading(false);
        var errF = resolveError(err);
        setOverlayContent(errF.title, errF.desc, Lang.queryJS('login.tryAgain'));
        setOverlayHandler(function () {
            formDisabled(false);
            toggleOverlay(false);
        });
        toggleOverlay(true);
        loggerLogin.log('Error while logging in.', err);
    });
});
