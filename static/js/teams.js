// УДАЛЕНИЕ КОМАНДЫ
document.addEventListener('DOMContentLoaded', () => {
    let deleteTeamBtns = document.querySelectorAll('.deleteTeamBtn');
    const modalDelete = new bootstrap.Modal(document.querySelector('#delete-team'));
    deleteTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let span = document.querySelector('#deleteTeamForm span');
            let teamIdInput = document.querySelector('[name=team_id]');
            span.innerHTML = e.currentTarget.dataset.teamName;
            teamIdInput.value = e.currentTarget.dataset.teamId;
            modalDelete.show();
        })
    })
});

// ПРОВЕРКА НАИМЕНОВАНИЯ КОМАНДЫ НА УНИКАЛЬНОСТЬ
const teamNameInput = document.querySelector('[name=team_name]');
const notUniqueWarning = document.querySelector('#notUniqueWarning');
const createTeamBtn = document.querySelector('#createTeamBtn');

teamNameInput.addEventListener('input', () => {
    let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let team_name = document.querySelector('[name=team_name]').value;

    let form_data = new FormData();
    form_data.append('action', 'check_team_name');
    form_data.append('team_name', team_name);

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
                notUniqueWarning.style.display = 'block';
                createTeamBtn.type = 'button';
            } else {
                notUniqueWarning.style.display = 'none';
                createTeamBtn.type = 'submit';
            }
        });
});

// ПОИСК ПОЛЬЗОВАТЕЛЯ
const searchUserForm = document.querySelector('#searchUserForm');
const searchedUsers = document.querySelector('#searchedUsers');

searchUserForm.addEventListener('submit', e => {
    e.preventDefault();

    let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let user_name = document.querySelector('[name=user_name]').value;

    let members_id = [];
    let members = document.querySelectorAll('.member');
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
            clearSearchResults();
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
                img.src = u.photo;

                let name = document.createElement('p');
                name.innerHTML = `${u.last_name} ${u.first_name} ${u.patronymic}`;

                let button = document.createElement('button');
                button.innerHTML = 'Добавить';
                button.classList.add('addMemberBtn', 'orange-btn');
                button.addEventListener('click', addMember);

                user.appendChild(img);
                user.appendChild(name);
                user.appendChild(button);

                searchedUsers.appendChild(user);
            });
        });
});

// ОЧИЩЕНИЕ РЕЗУЛЬТАТОВ ПОИСКА
function clearSearchResults() {
    document.querySelectorAll('.user').forEach(u => {
        searchedUsers.removeChild(u);
    });
}

// ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ В КОМАНДУ
const addedMembers = document.querySelector('#members');

function addMember(e) {
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
    button.addEventListener('click', deleteMember);

    member.appendChild(img);
    member.appendChild(name);
    member.appendChild(button);
    addedMembers.appendChild(member);
    clearSearchResults();
}

// УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ КОМАНДЫ
function deleteMember(e) {
    let member = e.target.parentElement;
    addedMembers.removeChild(member);
}

// СОЗДАНИЕ КОМАНДЫ
const createTeamForm = document.querySelector('#createTeamForm');
createTeamForm.addEventListener('submit', e => {
    e.preventDefault();
    let token = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let team_name = document.querySelector('[name=team_name]').value

    let members_id = [];
    let members = document.querySelectorAll('.member');
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



