import {getCSRFToken} from "./utils.js";

export function navbarSearchUsers() {
    const navbarUserNameInput = document.querySelector('[name=navbar_user_name]');
    const navbarSearchUserBtn = document.querySelector('#navbar-search-user-btn');
    const token = getCSRFToken();

    if (navbarUserNameInput && navbarSearchUserBtn) {
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
                renderResultSearchList(data);
            });
        });
    }
}

const resultBlock = document.querySelector('.search-result');
function renderResultSearchList(data) {
    document.querySelector('.search-result-list').innerHTML = '';
    if (data.users && data.users.length !== 0) {
        resultBlock.style.display = 'block';
        data.users.forEach(item => {
            document.querySelector('.search-result-list').insertAdjacentHTML('beforeend', template(item.cropped_photo_url, item.last_name, item.first_name))
        })
    }
}

function template(cropped_photo_url, last_name, first_name) {
    return `
        <li>
            <img src="${cropped_photo_url}">
            <p>${last_name} ${first_name}</p>
        </li>
    `
}

document.addEventListener('mouseup', function(event) {;
    if (!resultBlock.contains(event.target)) {
        resultBlock.style.display = 'none';
    }
});