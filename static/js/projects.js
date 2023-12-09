//ЭЛЕМЕНТЫ
const createProjectForm = document.querySelector('#create-project-form');
const createProjectBtn = document.querySelector('#create-project-btn');
const editProjectForm = document.querySelector('#edit-project-form');
const editProjectBtn = document.querySelector('#edit-project-btn');
const projectNameInputs = document.querySelectorAll('[name=project_name]');
const projectDeadlineInputs = document.querySelectorAll('[name=project_deadline]');
const projectDescrInputs = document.querySelectorAll('[name=project_description]');
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
    }
}));

// ПРОВЕРКА ЗАПОЛНЕНИЯ ПОЛЕЙ В ФОРМАХ СОЗДАНИЯ И РЕДАКТИРОВАНИЯ ПРОЕКТА
function checkInputs(action) {
    let form, btn, func;
    if (action == 'create-project') {
        form = createProjectForm;
        btn = createProjectBtn;
        func = createProject;
    } else {
        form = editProjectForm;
        btn = editProjectBtn;
        func = editProject;
    }

    if (!form.querySelector('[name=project_name]').value.trim()) {
        btn.removeEventListener('click', func);
        btn.classList.add('grey-btn');
        return;
    }

    if (!form.querySelector('[name=project_deadline]').value) {
        btn.removeEventListener('click', func);
        btn.classList.add('grey-btn');
        return;
    }

    if (!form.querySelector('[name=project_description]').value.trim()) {
        btn.removeEventListener('click', func);
        btn.classList.add('grey-btn');
        return;
    }

    let checkedRadio;
    form.querySelectorAll('[name=team_radio]').forEach(radio => {
        if (radio.checked) {
            checkedRadio = radio;
        }
    });

    if (checkedRadio.value == 'attach' && !form.querySelector('[name=project_team_id]').value) {
        btn.removeEventListener('click', func);
        btn.classList.add('grey-btn');
        return;
    }

    btn.addEventListener('click', func);
    btn.classList.remove('grey-btn');
}

projectNameInputs.forEach(input => input.addEventListener('input', () => {
        checkInputs(input.dataset.action);
    })
);

projectDeadlineInputs.forEach(input => input.addEventListener('input', () => {
        checkInputs(input.dataset.action);
    })
);

projectDescrInputs.forEach(input => input.addEventListener('input', () => {
        checkInputs(input.dataset.action);
    })
);

radios.forEach(radio => radio.addEventListener('change', () => {
        checkInputs(radio.dataset.action);
    })
);

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
            form.querySelector('.search-team-btn').classList.add('grey-btn');
        } else {
            form.querySelector('.search-team-btn').addEventListener('click', searchTeam);
            form.querySelector('.search-team-btn').classList.remove('grey-btn');
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
    form.querySelector('[name=project_team_id]').value = chosenTeam.dataset.teamId;
    checkInputs(action);
    clearSearchResults(form);
}

// ОТКРЕПЛЕНИЕ КОМАНДЫ ОТ ПРОЕКТА
function detachTeam(e) {
    let form, action;
    if (e.target.dataset.action == 'create-project') {
        form = createProjectForm;
        action = 'create-project';
    } else {
        form = editProjectForm;
        action = 'edit-project';
    }

    e.target.parentElement.remove();
    form.querySelector('.project-teams-text').style.display = 'none';
    form.querySelector('[name=project_team_id]').value = '';
    checkInputs(action);
    clearSearchResults(form);
}

// СОЗДАНИЕ ПРОЕКТА
function createProject() {
    let token = createProjectForm.querySelector('[name=csrfmiddlewaretoken]').value;
    let projectName = createProjectForm.querySelector('[name=project_name]').value;
    let projectTechTask = createProjectForm.querySelector('[name=project_tech_task]').files[0];
    let projectDeadline = createProjectForm.querySelector('[name=project_deadline]').value;
    let projectDescr = createProjectForm.querySelector('[name=project_description]').value;
    let projectTeamId = createProjectForm.querySelector('[name=project_team_id]').value;

    let formData = new FormData();
    formData.append('action', 'create_project');
    formData.append('project_name', projectName);
    if (projectTechTask) {
        formData.append('project_tech_task', projectTechTask, projectTechTask.name);
    }
    formData.append('project_deadline', projectDeadline);
    formData.append('project_descr', projectDescr);
    if (projectTeamId) {
           formData.append('project_team_id', projectTeamId);
    }

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

function editProject() {}

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