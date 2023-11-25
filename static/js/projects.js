// УДАЛЕНИЕ ПРОЕКТА
document.addEventListener('DOMContentLoaded', () => {
    let deleteTeamBtns = document.querySelectorAll('.deleteProjectBtn');
    const modalDelete = new bootstrap.Modal(document.querySelector('#delete-project'));
    deleteTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let span = document.querySelector('#deleteProjectForm span');
            let projectIdInput = document.querySelector('[name=project_id]');
            span.innerHTML = e.currentTarget.dataset.projectName;
            projectIdInput.value = e.currentTarget.dataset.projectId;
            modalDelete.show();
        })
    })
});


// СОЗДАНИЕ ПРОЕКТА
const createProjectBtn = document.querySelector('#createProjectBtn');
const createProjectForm = document.querySelector('#createProjectForm');

createProjectBtn.addEventListener('click', e => {
    console.log('click')
    createProjectForm.style.display = 'block';
});

// ДЕЙСТВИЕ ПО ВЫБОРУ RADIO
const radios = document.querySelectorAll('[name=team_radio]');
radios.forEach(radio => radio.addEventListener('change', (e) => {
    if (radio.checked) {
        if (radio.value == 'create') {
            document.querySelector('#searchTeamForm').parentElement.style.display = 'none';
        }
        if (radio.value == 'search') {
            document.querySelector('#searchTeamForm').parentElement.style.display = 'block';
        }
        if (radio.value == 'pass') {
            document.querySelector('#searchTeamForm').parentElement.style.display = 'none';
        }
    }
}));

// ПОИСК КОМАНДЫ
const searchTeamForm = document.querySelector('#searchTeamForm');
searchTeamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
    }
    fetch('', {
        method: 'POST',
        body: new FormData(searchTeamForm),
        headers: headers,
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            let result_div = document.createElement('div');
            result_div.classList.add('d-flex', 'flex-column');

            let teams = data.teams;
            teams.forEach((team) => {
                let team_div = document.createElement('div');
                team_div.classList.add('d-flex', 'justify-content-between');
                team_div.style.width = '80%';
                team_div.style.border = '2px solid orange';
                team_div.style.marginTop = '30px';
                let p = document.createElement('p');
                p.innerHTML = team.name;

                let button = document.createElement('button');
                button.innerHTML = 'Прикрепить';
                button.classList.add('orange-btn');
                button.dataset.teamId = team.id;
                button.onclick = function (e) {
                    document.querySelector('[name=team_id]').value = +e.target.dataset.teamId;
                };
                team_div.appendChild(p);
                team_div.appendChild(button);
                result_div.appendChild(team_div);
            });
            searchTeamForm.parentElement.appendChild(result_div);
        });
});


// РЕДАКТИРОВАНИЕ ПРОЕКТА
document.addEventListener('DOMContentLoaded', () => {
    let updateTeamBtns = document.querySelectorAll('.updateProjectBtn');
    const modalUpdate = new bootstrap.Modal(document.querySelector('#edit-project'));
    updateTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            modalUpdate.show();
        })
    })
});