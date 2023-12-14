// ЭЛЕМЕНТЫ
const deleteTeamForm = document.querySelector('#delete-team');
const createTeamForm = document.querySelector('#create-team-form');
const createTeamBtn = document.querySelector('#create-team-btn');
const editTeamForm = document.querySelector('#edit-team-form');
const editTeamBtn = document.querySelector('#edit-team-btn');
const editTeamBtns = document.querySelectorAll('.edit-team-btn');
const teamNameInputs = document.querySelectorAll('[name=team_name]');
const userNameInputs = document.querySelectorAll('[name=user_name]');

// получение csrf токена из cookie
function getCSRFToken() {
    return document.cookie.split(';').find((pair) => pair.includes('csrftoken')).split('=')[1]
}

// УДАЛЕНИЕ КОМАНДЫ
document.addEventListener('DOMContentLoaded', () => {
    let deleteTeamBtns = document.querySelectorAll('.delete-team-btn');
    const modalDelete = new bootstrap.Modal(document.querySelector('#delete-team'));
    deleteTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let span = document.querySelector('#delete-team-form span');
            let teamIdInput = deleteTeamForm.querySelector('[name=team_id]');
            span.innerHTML = e.currentTarget.dataset.teamName;
            teamIdInput.value = e.currentTarget.dataset.teamId;
            modalDelete.show();
        })
    })
});

// ПРОВЕРКА НАЛИЧИЯ НАИМЕНОВАНИЯ КОМАНДЫ И ЕГО УНИКАЛЬНОСТИ
function checkTeamName(action) {
    let form, btn, func;
    if (action == 'create-team') {
        form = createTeamForm;
        btn = createTeamBtn;
        func = createTeam;
    } else {
        form = editTeamForm;
        btn = editTeamBtn;
        func = editTeam;
    }

    let token = getCSRFToken();
    let teamName = form.querySelector('[name=team_name]').value;

    if (!teamName.trim()) {
        btn.removeEventListener('click', func);
        btn.classList.add('grey-btn');
        return;
    }

    let formData = new FormData();
    formData.append('action', 'check_team_name');
    formData.append('team_name', teamName);

    if (action == 'edit-team') {
        let teamId = form.querySelector('[name=team_id]').value;
        formData.append('team_id', teamId);
    }

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
            if (!data.unique) {
                form.querySelector('.not-unique-warning').style.display = 'block';
                btn.removeEventListener('click', func);
                btn.classList.add('grey-btn');
            } else {
                form.querySelector('.not-unique-warning').style.display = 'none';
                btn.addEventListener('click', func);
                btn.classList.remove('grey-btn');
            }
        });
}

teamNameInputs.forEach(input => {
    input.addEventListener('input', () => {
        checkTeamName(input.dataset.action);
    });
});

// ПРОВЕРКА НАЛИЧИЯ ЗАПРОСА В ФОРМАХ ПОИСКА ПОЛЬЗОВАТЕЛЯ
userNameInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let form;
        if (e.target.dataset.action == 'create-team') {
            form = createTeamForm;
        } else {
            form = editTeamForm;
        }

        if (!input.value.trim()) {
            form.querySelector('.search-user-btn').removeEventListener('click', searchUser);
            form.querySelector('.search-user-btn').classList.add('grey-btn');
        } else {
            form.querySelector('.search-user-btn').addEventListener('click', searchUser);
            form.querySelector('.search-user-btn').classList.remove('grey-btn');
        }
    });
});

// ПОИСК ПОЛЬЗОВАТЕЛЯ
function searchUser(e) {
    let form, action;
    if (e.target.dataset.action == 'create-team') {
        form = createTeamForm;
        action = 'create-team';
    } else {
        form = editTeamForm;
        action = 'edit-team';
    }

    let token = getCSRFToken();
    let userName = form.querySelector('[name=user_name]').value;

    let membersId = [];
    let members = form.querySelectorAll('.member');
    members.forEach(member => {
        membersId.push(+member.dataset.memberId);
    });

    let formData = new FormData();
    formData.append('action', 'search_user');
    formData.append('user_name', userName);
    formData.append('members_id', JSON.stringify(membersId));

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
        clearSearchResults(form);
        let searchedUsers = data.users;
        if (searchedUsers.length == 0) {
            form.querySelector('.empty-results-text').style.display = 'block';
            return;
        } else {
            form.querySelector('.empty-results-text').style.display = 'none';
        }

        searchedUsers.forEach(user => {
            let userElement = document.createElement('div');
            userElement.dataset.userId = user.id;
            userElement.classList.add('searched-user');

            let innerBlockSearched = document.createElement('div');
            innerBlockSearched.classList.add('searched-user__inner');
            let img = document.createElement('img');
            img.src = user.cropped_photo_url;
            let name = document.createElement('p');
            name.innerHTML = `${user.last_name} ${user.first_name} ${user.patronymic ? user.patronymic : ''}`;

            let button = document.createElement('button');
            button.classList.add('addMemberBtn', 'add-btn-team');
            button.dataset.action = action;
            button.innerHTML = `
                <svg class="addMemberBtn" data-action="create-team" width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M8.77778 15H15M15 15H21.2222M15 15V21.2222M15 15V8.77778M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            button.addEventListener('click', (e) => {
                console.log(e);
                addMember(e);
            });

            userElement.appendChild(innerBlockSearched);
            innerBlockSearched.appendChild(img);
            innerBlockSearched.appendChild(name);
            userElement.appendChild(button);
            form.querySelector('.searched-users').appendChild(userElement);
            document.querySelectorAll('.searchInput').forEach(input => {
                input.value = '';
            });
        });
    });
}

// ОЧИЩЕНИЕ РЕЗУЛЬТАТОВ ПОИСКА
function clearSearchResults(form) {
    form.querySelector('.empty-results-text').style.display = 'none';
    form.querySelectorAll('.searched-user').forEach(user => {
        user.remove();
    });
}

// ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ В КОМАНДУ
function addMember(e) {
    let form, action;
    if (e.currentTarget .dataset.action == 'create-team') {
        form = createTeamForm;
        action = 'create-team';
    } else {
        form = editTeamForm;
        action = 'edit-team';
        checkTeamName(action);
    }

    let chosenUser = e.currentTarget.parentElement;

    let memberElement = document.createElement('div');
    memberElement.dataset.memberId = chosenUser.dataset.userId;
    memberElement.classList.add('member');

    let innerBlockMember = document.createElement('div');
    innerBlockMember.classList.add('member-user__inner');

    let img = document.createElement('img');
    img.src = chosenUser.querySelector('img').src;

    let name = document.createElement('p');
    name.innerHTML = chosenUser.querySelector('p').innerHTML;

    let button = document.createElement('button');
    button.classList.add('delete-member-btn', 'delete-btn-team');
    button.dataset.action = action;
    button.innerHTML = `
        <svg width="28" height="28" class="delete-member-btn" data-action="create-team" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M8.77778 15H21.2222M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    button.addEventListener('click', (e) => {
        deleteMember(e)
    });

    memberElement.appendChild(innerBlockMember);
    innerBlockMember.appendChild(img);
    innerBlockMember.appendChild(name);
    memberElement.appendChild(button);
    form.querySelector('.members-text').style.display = 'block';
    form.querySelector('.members').appendChild(memberElement);
    clearSearchResults(form);
}

// УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ КОМАНДЫ
function deleteMember(e) {
    let form;
    if (e.currentTarget.dataset.action == 'create-team') {
        form = createTeamForm;
    } else {
        form = editTeamForm;
        checkTeamName('edit-team');
    }

    e.currentTarget.parentElement.remove();
    if (!form.querySelector('.member')) {
        form.querySelector('.members-text').style.display = 'none';
    }
    clearSearchResults(form);
}

// СОЗДАНИЕ КОМАНДЫ
function createTeam() {
    let token =getCSRFToken();
    let teamName = createTeamForm.querySelector('[name=team_name]').value;

    let membersId = [];
    let members = createTeamForm.querySelectorAll('.member');
    members.forEach(member => {
        membersId.push(+member.dataset.memberId);
    });

    let formData = new FormData();
    formData.append('action', 'create_team');
    formData.append('team_name', teamName);
    formData.append('members_id', JSON.stringify(membersId));

    fetch('', {
        method: 'POST',
        body: formData,
        headers: {
            "X-CSRFToken": token,
        }
    })
        .then(() => {
            document.location.reload();
        });
}

// РЕДАКТИРОВАНИЕ КОМАНДЫ
function editTeam() {
    let token = getCSRFToken();
    let teamId = editTeamForm.querySelector('[name=team_id]').value;
    let teamName = editTeamForm.querySelector('[name=team_name]').value;

    let membersId = [];
    let members = editTeamForm.querySelectorAll('.member');
    members.forEach(member => {
        membersId.push(+member.dataset.memberId);
    });

    let formData = new FormData();
    formData.append('action', 'edit_team');
    formData.append('team_id', teamId);
    formData.append('team_name', teamName);
    formData.append('members_id', JSON.stringify(membersId));

    fetch('', {
        method: 'POST',
        body: formData,
        headers: {
            "X-CSRFToken": token,
        }
    })
        .then(() => {
            document.location.reload();
        });
}

// ВСТАВКА ДАННЫХ О КОМАНДЕ ДЛЯ РЕДАКТИРОВАНИЯ
editTeamBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        let token = getCSRFToken();
        let teamId = e.currentTarget.dataset.teamId;

        let formData = new FormData();
        formData.append('action', 'get_team_info');
        formData.append('team_id', teamId);

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
                editTeamForm.querySelector('[name=team_id]').value = teamId;
                editTeamForm.querySelector('[name=team_name]').value = data.name;

                let members = data.members;
                editTeamForm.querySelector('.members').innerHTML = '';
                members.forEach(m => {
                    let member = document.createElement('div');
                    member.dataset.memberId = m.id;
                    member.classList.add('member');

                    let innerBlockMember = document.createElement('div');
                    innerBlockMember.classList.add('member-user__inner');

                    let img = document.createElement('img');
                    img.src = m.cropped_photo_url;

                    let name = document.createElement('p');
                    name.innerHTML = `${m.last_name} ${m.first_name} ${m.patronymic ? m.patronymic : ''}`;

                    let button = document.createElement('button');
                    button.classList.add('deleteMemberBtn', 'delete-btn-team');
                    button.dataset.action = 'edit-team';
                    button.innerHTML = `
                        <svg width="28" height="28" class="deleteMemberBtn" data-action="edit-team" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M8.77778 15H21.2222M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `;
                    button.addEventListener('click', deleteMember);

                    member.appendChild(innerBlockMember);
                    innerBlockMember.appendChild(img);
                    innerBlockMember.appendChild(name);
                    member.appendChild(button);
                    document.querySelector('#edit-team-form .members-text').style.display = 'block';
                    editTeamForm.querySelector('.members').appendChild(member);
                });
            })
    });
});

/* СОЗДАНИЕ КОМАНДЫ - МОДАЛЬНОЕ ОКНО */
document.addEventListener('DOMContentLoaded', () => {
    let createTeamBtn = document.querySelector('#create-team-btn-modal');
    const modalCreate = new bootstrap.Modal(document.querySelector('#create-team'));

    createTeamBtn.addEventListener('click', () => {
        document.querySelectorAll('.members').forEach(item => {
            item.innerHTML = '';
        })
        document.querySelectorAll('.searched-users').forEach(item => {
            item.innerHTML = '';
        })
        document.querySelectorAll('.searchInput').forEach(input => {
            input.value = '';
        })
        document.querySelectorAll('.nameTeamInput').forEach(input => {
            input.value = '';
        })
        document.querySelector('.members-text').style.display = 'none';
        document.querySelector('.not-unique-warning').style.display = 'none';

        checkTeamName('create-team');

        document.querySelector('.search-user-btn').removeEventListener('click', searchUser);
        document.querySelector('.search-user-btn').classList.add('grey-btn');

        document.querySelectorAll('.empty-results-text').forEach(block => {
            block.style.display = 'none';
        })

        modalCreate.show();
    })
});

/* РЕДАКТИРОВАНИЕ КОМАНДЫ - МОДАЛЬНОЕ ОКНО */
document.addEventListener('DOMContentLoaded', () => {
    let editTeamBtns = document.querySelectorAll('.edit-team-btn');
    const modalEdit = new bootstrap.Modal(document.querySelector('#edit-team'));
    editTeamBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.searched-users').forEach(item => {
                item.innerHTML = '';
            })
            document.querySelectorAll('.searchInput').forEach(input => {
                input.value = '';
            })

            document.querySelectorAll('.search-user-btn').forEach(btn => {
                btn.removeEventListener('click', searchUser);
            })
            document.querySelectorAll('.search-user-btn').forEach(btn => {
                btn.classList.add('grey-btn');
            })

            document.querySelectorAll('.empty-results-text').forEach(block => {
                block.style.display = 'none';
            })

            modalEdit.show();
        })
    })
});

/* СЛАЙДЕР */
const swiperList = document.querySelectorAll('.slider-container');
let count = 1;
swiperList.forEach((swiper) => {
    let swiper_slider_id = count;
    swiper.childNodes[1].classList.add(`swiper-${swiper_slider_id}`);
    swiper.childNodes[1].childNodes[3].classList.add(`swiper-pagination-${swiper_slider_id}`);
    swiper.childNodes[3].childNodes[1].classList.add(`slider-button-prev-${swiper_slider_id}`);
    swiper.childNodes[3].childNodes[3].classList.add(`slider-button-next-${swiper_slider_id}`);

    const teamSwiper = new Swiper(`.swiper-${swiper_slider_id}`, {
        direction: 'horizontal',
        loop: true,
        slidesPerView: 5,
        slideToClickedSlide: false,
        spaceBetween: 15,
        initialSlide: 0,
        centerInsufficientSlides: true,

        pagination: {
            el: `.swiper-pagination-${swiper_slider_id}`,
        },

        navigation: {
            nextEl: `.slider-button-next-${swiper_slider_id}`,
            prevEl: `.slider-button-prev-${swiper_slider_id}`,
        },
    });
    count++;
})



