// ЭЛЕМЕНТЫ
const deleteTeamForm = document.querySelector('#delete-team');
const createTeamForm = document.querySelector('#createTeamForm');
const createTeamBtn = document.querySelector('#createTeamBtn');
const editTeamForm = document.querySelector('#editTeamForm');
const editTeamBtn = document.querySelector('#editTeamBtn');
const editTeamBtns = document.querySelectorAll('.edit-team-btn');
const teamNameInputs = document.querySelectorAll('[name=team_name]');
const userNameInputs = document.querySelectorAll('[name=user_name]');

// УДАЛЕНИЕ КОМАНДЫ
document.addEventListener('DOMContentLoaded', () => {
    let deleteTeamBtns = document.querySelectorAll('.deleteTeamBtn');
    const modalDelete = new bootstrap.Modal(document.querySelector('#delete-team'));
    deleteTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let span = document.querySelector('#deleteTeamForm span');
            let teamIdInput = deleteTeamForm.querySelector('[name=team_id]');
            span.innerHTML = e.currentTarget.dataset.teamName;
            teamIdInput.value = e.currentTarget.dataset.teamId;
            modalDelete.show();
        })
    })
});

// ПРОВЕРКА НАЛИЧИЯ НАИМЕНОВАНИЯ КОМАНДЫ И ЕГО УНИКАЛЬНОСТИ
teamNameInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let form, btn, func;
        if (e.target.dataset.action == 'create-team') {
            form = createTeamForm;
            btn = createTeamBtn;
            func = create_team;
        } else {
            form = editTeamForm;
            btn = editTeamBtn;
            func = edit_team;
        }

        let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
        let team_name = e.target.value;

        if (!team_name.trim()) {
            btn.removeEventListener('click', func);
            return;
        }

        let form_data = new FormData();
        form_data.append('action', 'check_team_name');
        form_data.append('team_name', team_name);

        if (e.target.dataset.action == 'edit-team') {
            let team_id = form.querySelector('[name=team_id]').value;
            form_data.append('team_id', team_id);
        }

        fetch('', {
            method: 'POST',
            body: form_data,
            headers: {
                "X-CSRFToken": token,
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (!data.unique) {
                    form.querySelector('.notUniqueWarning').style.display = 'block';
                    btn.removeEventListener('click', func);
                } else {
                    form.querySelector('.notUniqueWarning').style.display = 'none';
                    btn.addEventListener('click', func);
                }
            });
    });
});

// ПОИСК ПОЛЬЗОВАТЕЛЯ
function search_users(e) {
    let form, action;
    if (e.target.dataset.action == 'create-team') {
        form = createTeamForm;
        action = 'create-team';
    } else {
        form = editTeamForm;
        action = 'edit-team';
    }

    let token = form.querySelector('[name=csrfmiddlewaretoken]').value;
    let user_name = form.querySelector('[name=user_name]').value;

    let members_id = [];
    let members = form.querySelectorAll('.member');
    members.forEach(member => {
        members_id.push(+member.dataset.memberId);
    });

    let form_data = new FormData();
    form_data.append('action', 'search_user');
    form_data.append('user_name', user_name);
    form_data.append('members_id', JSON.stringify(members_id));

    fetch('', {
        method: 'POST',
        body: form_data,
        headers: {
            "X-CSRFToken": token,
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            clearSearchResults(form);
            let new_users = data.users;
            new_users.forEach(u => {
                let user = document.createElement('div');
                user.dataset.userId = u.id;
                user.classList.add('user', 'd-flex', 'justify-content-between', 'align-items-center');
                user.style.width = '80%';
                user.style.border = '2px solid orange';
                user.style.marginTop = '30px';

                let img = document.createElement('img');
                img.style.width = '100px';
                img.src = u.cropped_photo;

                let name = document.createElement('p');
                name.innerHTML = `${u.last_name} ${u.first_name} ${u.patronymic ? u.patronymic : ''}`;

                let button = document.createElement('button');
                button.innerHTML = 'Добавить';
                button.classList.add('addMemberBtn', 'orange-btn');
                button.dataset.action = action;
                button.addEventListener('click', addMember);

                user.appendChild(img);
                user.appendChild(name);
                user.appendChild(button);

                form.querySelector('.searchedUsers').appendChild(user);
            });
        });
}

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
            form.querySelector('.searchUserBtn').removeEventListener('click', search_users);
        } else {
            form.querySelector('.searchUserBtn').addEventListener('click', search_users);
        }
    });
});

// ОЧИЩЕНИЕ РЕЗУЛЬТАТОВ ПОИСКА
function clearSearchResults(form) {
    form.querySelectorAll('.user').forEach(u => {
        form.querySelector('.searchedUsers').removeChild(u);
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
    }

    let user = e.target.parentElement;

    let member = document.createElement('div');
    member.dataset.memberId = user.dataset.userId;
    member.classList.add('member', 'd-flex', 'justify-content-between', 'align-items-center');
    member.style.width = '80%';
    member.style.border = '2px solid orange';
    member.style.marginTop = '30px';

    let img = document.createElement('img');
    img.style.width = '100px';
    img.src = user.querySelector('img').src;

    let name = document.createElement('p');
    name.innerHTML = user.querySelector('p').innerHTML;

    let button = document.createElement('button');
    button.innerHTML = 'Удалить';
    button.classList.add('deleteMemberBtn', 'orange-btn');
    button.dataset.action = action;
    button.addEventListener('click', deleteMember);

    member.appendChild(img);
    member.appendChild(name);
    member.appendChild(button);
    form.querySelector('.members').appendChild(member);
    clearSearchResults(form);
}

// УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ КОМАНДЫ
function deleteMember(e) {
    let form;
    if (e.target.dataset.action == 'create-team') {
        form = createTeamForm;
    } else {
        form = editTeamForm;
    }

    let member = e.target.parentElement;
    form.querySelector('.members').removeChild(member);
}

// СОЗДАНИЕ КОМАНДЫ
function create_team() {
    let token = createTeamForm.querySelector('[name=csrfmiddlewaretoken]').value;
    let team_name = createTeamForm.querySelector('[name=team_name]').value;

    let members_id = [];
    let members = createTeamForm.querySelectorAll('.member');
    members.forEach(member => {
        members_id.push(+member.dataset.memberId);
    });

    let form_data = new FormData();
    form_data.append('action', 'create_team');
    form_data.append('team_name', team_name);
    form_data.append('members_id', JSON.stringify(members_id));

    fetch('', {
        method: 'POST',
        body: form_data,
        headers: {
            "X-CSRFToken": token,
        }
    })
        .then(() => {
            document.location.reload();
        });
}

// РЕДАКТИРОВАНИЕ КОМАНДЫ
function edit_team() {
    let token = editTeamForm.querySelector('[name=csrfmiddlewaretoken]').value;
    let team_id = editTeamForm.querySelector('[name=team_id]').value;
    let team_name = editTeamForm.querySelector('[name=team_name]').value;

    let members_id = [];
    let members = editTeamForm.querySelectorAll('.member');
    members.forEach(member => {
        members_id.push(+member.dataset.memberId);
    });

    let form_data = new FormData();
    form_data.append('action', 'edit_team');
    form_data.append('team_id', team_id);
    form_data.append('team_name', team_name);
    form_data.append('members_id', JSON.stringify(members_id));

    fetch('', {
        method: 'POST',
        body: form_data,
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
        let team_id = e.currentTarget.dataset.teamId;

        let form_data = new FormData();
        form_data.append('action', 'get_team_info');
        form_data.append('team_id', team_id);

        fetch('', {
            method: 'POST',
            body: form_data,
            headers: {
                "X-CSRFToken": token,
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                editTeamForm.querySelector('[name=team_id]').value = team_id;
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



