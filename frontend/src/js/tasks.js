// ПОЛУЧЕНИЕ CSRF ТОКЕНА ИЗ COOKIE
function getCSRFToken() {
    return document.cookie.split(';').find((pair) => pair.includes('csrftoken')).split('=')[1]
}

// ПОИСК ПОЛЬЗОВАТЕЛЕЙ В НАВБАРЕ
const navbarUserNameInput = document.querySelector('[name=navbar_user_name]');
const navbarSearchUserBtn = document.querySelector('#navbar-search-user-btn');
const token = getCSRFToken();

navbarUserNameInput.addEventListener('input', () => {
    navbarSearchUserBtn.disabled = !Boolean(navbarUserNameInput.value.trim());
});

navbarSearchUserBtn.addEventListener('click', () => {
    let navbarUserName = navbarUserNameInput.value.trim();
    let formData = new FormData();
    formData.append('action', 'navbar_search_user');
    formData.append('navbar_user_name', navbarUserName);

    fetch('', {
        method: 'POST',
        body: formData,
        headers: {
            "X-CSRFToken": token,
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        });
});






