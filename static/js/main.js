// ОБРАБОТКА ОШИБОК ФОРМЫ АВТОРИЗАЦИИ
document.addEventListener("DOMContentLoaded", () => {
    const openModalAuthBtn = document.querySelector('#openModalAuthBtn');
    const modalAutorization = new bootstrap.Modal(document.querySelector('#autorization'));
    const authorizationForm = document.querySelector('#authorizationForm');

    openModalAuthBtn.addEventListener('click', () => {
        modalAutorization.show()
    })

    if (authorizationForm.contains(document.querySelector('#errorMessage'))) {
        modalAutorization.show()
    }
});










