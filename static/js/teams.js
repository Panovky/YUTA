// ЭЛЕМЕНТЫ
const deleteTeamForm = document.querySelector('#delete-team');
const createTeamForm = document.querySelector('#create-team-form');
const createTeamBtn = document.querySelector('#create-team-btn');
const editTeamForm = document.querySelector('#edit-team-form');
const editTeamBtn = document.querySelector('#edit-team-btn');
const editTeamBtns = document.querySelectorAll('.edit-team-btn');
const teamNameInputs = document.querySelectorAll('[name=team_name]');
const userNameInputs = document.querySelectorAll('[name=user_name]');

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

    let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
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

    let token = form.querySelector('[name=csrfmiddlewaretoken]').value;
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
                userElement.classList.add('searched-user', 'd-flex', 'justify-content-between', 'align-items-center');
                userElement.style.width = '80%';
                userElement.style.border = '2px solid orange';
                userElement.style.marginTop = '30px';

                let img = document.createElement('img');
                img.style.width = '100px';
                img.src = user.cropped_photo;

                let name = document.createElement('p');
                name.innerHTML = `${user.last_name} ${user.first_name} ${user.patronymic ? user.patronymic : ''}`;

                let button = document.createElement('button');
                button.innerHTML = 'Добавить';
                button.classList.add('addMemberBtn', 'orange-btn');
                button.dataset.action = action;
                button.addEventListener('click', addMember);

                userElement.appendChild(img);
                userElement.appendChild(name);
                userElement.appendChild(button);
                form.querySelector('.searched-users').appendChild(userElement);
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
    if (e.target.dataset.action == 'create-team') {
        form = createTeamForm;
        action = 'create-team';
    } else {
        form = editTeamForm;
        action = 'edit-team';
        checkTeamName(action);
    }

    let chosenUser = e.target.parentElement;

    let memberElement = document.createElement('div');
    memberElement.dataset.memberId = chosenUser.dataset.userId;
    memberElement.classList.add('member', 'd-flex', 'justify-content-between', 'align-items-center');
    memberElement.style.width = '80%';
    memberElement.style.border = '2px solid orange';
    memberElement.style.marginTop = '30px';

    let img = document.createElement('img');
    img.style.width = '100px';
    img.src = chosenUser.querySelector('img').src;

    let name = document.createElement('p');
    name.innerHTML = chosenUser.querySelector('p').innerHTML;

    let button = document.createElement('button');
    button.innerHTML = 'Удалить';
    button.classList.add('delete-member-btn', 'orange-btn');
    button.dataset.action = action;
    button.addEventListener('click', deleteMember);

    memberElement.appendChild(img);
    memberElement.appendChild(name);
    memberElement.appendChild(button);
    form.querySelector('.members-text').style.display = 'block';
    form.querySelector('.members').appendChild(memberElement);
    clearSearchResults(form);
}

// УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ КОМАНДЫ
function deleteMember(e) {
    let form;
    if (e.target.dataset.action == 'create-team') {
        form = createTeamForm;
    } else {
        form = editTeamForm;
        checkTeamName('edit-team');
    }

    e.target.parentElement.remove();
    if (!form.querySelector('.member')) {
        form.querySelector('.members-text').style.display = 'none';
    }
    clearSearchResults(form);
}

// СОЗДАНИЕ КОМАНДЫ
function createTeam() {
    let token = createTeamForm.querySelector('[name=csrfmiddlewaretoken]').value;
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
    let token = editTeamForm.querySelector('[name=csrfmiddlewaretoken]').value;
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
        let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
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
                members.forEach(m => {
                    let member = document.createElement('div');
                    member.dataset.memberId = m.id;
                    member.classList.add('member', 'd-flex', 'justify-content-between', 'align-items-center');
                    member.style.width = '80%';
                    member.style.border = '2px solid orange';
                    member.style.marginTop = '30px';

                    let img = document.createElement('img');
                    img.style.width = '100px';
                    img.src = m.cropped_photo;

                    let name = document.createElement('p');
                    name.innerHTML = `${m.last_name} ${m.first_name} ${m.patronymic ? m.patronymic : ''}`;

                    let button = document.createElement('button');
                    button.innerHTML = 'Удалить';
                    button.classList.add('deleteMemberBtn', 'orange-btn');
                    button.dataset.action = 'edit-team';
                    button.addEventListener('click', deleteMember);

                    member.appendChild(img);
                    member.appendChild(name);
                    member.appendChild(button);
                    editTeamForm.querySelector('.members').appendChild(member);
                });
            })
    });
});

/* РЕДАКТИРОВАНИЕ КОМАНДЫ */
document.addEventListener('DOMContentLoaded', () => {
    let editTeamBtns = document.querySelectorAll('.edit-team-btn');
    const modalEdit = new bootstrap.Modal(document.querySelector('#edit-team'));
    editTeamBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
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

        breakpoints: {
            100: {
                slidesPerView: 3,
                spaceBetween: 5
            },
            576: {},
            768: {},
            992: {},
            1200: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            }
        }
    });
    count++;
})



