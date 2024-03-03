// ОБРАБОТКА ОШИБОК ФОРМЫ АВТОРИЗАЦИИ
document.addEventListener("DOMContentLoaded", () => {
    const openModalAuthBtn = document.querySelector('#openModalAuthBtn');
    const modalAutorization = new bootstrap.Modal(document.querySelector('#autorization'));
    const authorizationForm = document.querySelector('#authorizationForm');
    const inputLogin = document.querySelector('#Login');
    const inputPassword = document.querySelector('#Password');
    const authBtn = document.querySelector('#auth-btn');

    openModalAuthBtn.addEventListener('click', () => {
        modalAutorization.show()
    })

    if (authorizationForm.contains(document.querySelector('#errorMessage'))) {
        modalAutorization.show()
    }

    authorizationForm.addEventListener('input', () => {
        authBtn.disabled = [inputLogin, inputPassword].some(input => !input.value.trim());
    })
});










