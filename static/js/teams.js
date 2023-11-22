// УДАЛЕНИЕ КОМАНДЫ
const deleteTeamBtns = document.querySelectorAll('.deleteTeamBtn');
const deleteTeamForm = document.querySelector('#deleteTeamForm');

deleteTeamBtns.forEach((btn) => btn.addEventListener('click', e => {
    let span = document.querySelector('#deleteTeamForm span');
    let teamIdInput = document.querySelector('[name=team_id]');
    span.innerHTML = e.target.dataset.teamName;
    teamIdInput.value = e.target.dataset.teamId;
    deleteTeamForm.style.display = 'block';
}));

// ПОИСК ПОЛЬЗОВАТЕЛЯ
const searchUserForm = document.querySelector('#searchUserForm');
const searchedUsers = document.querySelector('#searchedUsers');

searchUserForm.addEventListener('submit', e => {
    e.preventDefault();
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
    }
    fetch('', {
        method: 'POST',
        body: new FormData(searchUserForm),
        headers: headers,
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
    let members = document.querySelectorAll('.member');
    let user = e.target.parentElement;
    let check = true;

    members.forEach(member => {
        if (member.dataset.memberId == user.dataset.userId) {
            check = false;
        }
    });

    if (!check) {
        return;
    }

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

    fetch('', {
        method: 'POST',
        body: JSON.stringify({
            action: 'create_team',
            team_name: team_name,
            members_id: members_id
        }),
        headers: {
            "X-CSRFToken": token,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(() => {
            document.location.reload();
        });
});