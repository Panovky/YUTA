import {getCSRFToken} from "./utils.js";

export function navbarSearchUsers() {
    const navbarUserNameInput = document.querySelector('[name=navbar_user_name]');
    const token = getCSRFToken();

    if (navbarUserNameInput) {
        navbarUserNameInput.addEventListener('input', () => {
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
            document.querySelector('.search-result-list').insertAdjacentHTML('beforeend', template(item.profile_url, item.cropped_photo_url, item.last_name, item.first_name, item.patronymic))
        })
    } else {
        resultBlock.style.display = 'none';
    }
}

function template(profile_url, cropped_photo_url, last_name, first_name, patronymic) {
    return `
        <li>
            <a href="${profile_url}">
                <img src="${cropped_photo_url}">
                <p>${last_name} ${first_name} ${patronymic ? patronymic : ''}</p>
            </a>
        </li>
    `
}

document.addEventListener('mouseup', function(event) {;
    if (!resultBlock.contains(event.target)) {
        resultBlock.style.display = 'none';
    }
});