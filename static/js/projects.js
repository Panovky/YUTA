//ЭЛЕМЕНТЫ
const createProjectForm = document.querySelector('#create-project-form');
const editProjectForm = document.querySelector('#edit-project-form');
const teamNameInputs = document.querySelectorAll('[name=team_name]');
const radios = document.querySelectorAll('[name=team_radio]');

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

// ДЕЙСТВИЕ ПО ВЫБОРУ RADIO
radios.forEach(radio => radio.addEventListener('change', (e) => {
    let form;
    if (e.target.dataset.action == 'create-project') {
        form = createProjectForm;
    } else {
        form = editProjectForm;
    }
    if (radio.checked) {
        if (radio.value == 'pass') {
            form.querySelector('.search-team-form').style.display = 'none';
        }
        if (radio.value == 'attach') {
            form.querySelector('.search-team-form').style.display = 'block';
        }
        if (radio.value == 'create') {
            form.querySelector('.search-team-form').style.display = 'none';
        }
    }
}));

// ПРОВЕРКА НАЛИЧИЯ ЗАПРОСА В ФОРМАХ ПОИСКА КОМАНДЫ
teamNameInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let form;
        if (e.target.dataset.action == 'create-project') {
            form = createProjectForm;
        } else {
            form = editProjectForm;
        }

        if (!input.value.trim()) {
            form.querySelector('.search-team-btn').removeEventListener('click', searchTeam);
        } else {
            form.querySelector('.search-team-btn').addEventListener('click', searchTeam);
        }
    });
});

// ПОИСК КОМАНДЫ
function searchTeam(e) {
    let form, action;
    if (e.target.dataset.action == 'create-project') {
        form = createProjectForm;
        action = 'create-project';
    } else {
        form = editProjectForm;
        action = 'edit-project';
    }

    let token = form.querySelector('[name=csrfmiddlewaretoken]').value;
    let teamName = form.querySelector('[name=team_name]').value;

    let projectTeamsId = [];
    let projectTeams = form.querySelectorAll('.project-team');
    projectTeams.forEach(projectTeam => {
        projectTeamsId.push(+projectTeam.dataset.teamId);
    });

    let formData = new FormData();
    formData.append('action', 'search_team');
    formData.append('team_name', teamName);
    formData.append('project_teams_id', JSON.stringify(projectTeamsId));

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
            let searchedTeams = data.teams;
            if (searchedTeams.length == 0) {
                form.querySelector('.empty-results-text').style.display = 'block';
                return;
            } else {
                form.querySelector('.empty-results-text').style.display = 'none';
            }

            searchedTeams.forEach(team => {
                let teamElement = document.createElement('div');
                teamElement.dataset.teamId = team.id;
                teamElement.classList.add('searched-team', 'd-flex', 'justify-content-between', 'align-items-center');
                teamElement.style.width = '80%';
                teamElement.style.border = '2px solid orange';
                teamElement.style.marginTop = '30px';

                let name = document.createElement('p');
                name.innerHTML = team.name;

                let button = document.createElement('button');
                button.innerHTML = 'Прикрепить';
                button.classList.add('attach-team-btn', 'orange-btn');
                button.dataset.action = action;
                button.addEventListener('click', attachTeam);

                teamElement.appendChild(name);
                teamElement.appendChild(button);
                form.querySelector('.searched-teams').appendChild(teamElement);
            });
        });
}

// ОЧИЩЕНИЕ РЕЗУЛЬТАТОВ ПОИСКА
function clearSearchResults(form) {
    form.querySelector('.empty-results-text').style.display = 'none';
    form.querySelectorAll('.searched-team').forEach(team => {
        team.remove();
    });
}

// ПРИКРЕПЛЕНИЕ КОМАНДЫ К ПРОЕКТУ
function attachTeam(e) {
    let form, action;
    if (e.target.dataset.action == 'create-project') {
        form = createProjectForm;
        action = 'create-project';
    } else {
        form = editProjectForm;
        action = 'edit-project';
    }

    let chosenTeam = e.target.parentElement;

    let teamElement = document.createElement('div');
    teamElement.dataset.teamId = chosenTeam.dataset.teamId;
    teamElement.classList.add('project-team', 'd-flex', 'justify-content-between', 'align-items-center');
    teamElement.style.width = '80%';
    teamElement.style.border = '2px solid orange';

    let name = document.createElement('p');
    name.innerHTML = chosenTeam.querySelector('p').innerHTML;

    let button = document.createElement('button');
    button.innerHTML = 'Открепить';
    button.classList.add('detach-team-btn', 'orange-btn');
    button.dataset.action = action;
    button.addEventListener('click', detachTeam);

    teamElement.appendChild(name);
    teamElement.appendChild(button);

    let projectTeam = form.querySelector('.project-team');
    if (projectTeam) {
        projectTeam.remove();
    }

    form.querySelector('.project-teams-text').style.display = 'block';
    form.querySelector('.project-teams').appendChild(teamElement);
    clearSearchResults(form);
}

// ОТКРЕПЛЕНИЕ КОМАНДЫ ОТ ПРОЕКТА
function detachTeam(e) {
    let form;
    if (e.target.dataset.action == 'create-project') {
        form = createProjectForm;
    } else {
        form = editProjectForm;
    }

    e.target.parentElement.remove();
    form.querySelector('.project-teams-text').style.display = 'none';
    clearSearchResults(form);
}

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