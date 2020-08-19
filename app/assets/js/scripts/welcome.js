/**
 * Script for welcome.ejs
 */
document.getElementById('welcomeButton').addEventListener('click', function (e) {
    switchView(VIEWS.welcome, VIEWS.login);
});
