//ЭЛЕМЕНТЫ
const deleteProjectForm = document.querySelector('#delete-project');
const createProjectForm = document.querySelector('#create-project-form');
const createProjectBtn = document.querySelector('#create-project-btn');
const editProjectForm = document.querySelector('#edit-project-form');
const editProjectBtn = document.querySelector('#edit-project-btn');
const editProjectBtns = document.querySelectorAll('.edit-project-btn');
const projectNameInputs = document.querySelectorAll('[name=project_name]');
const projectTechnicalTaskInputs = document.querySelectorAll('[name=project_technical_task]');
const projectDeadlineInputs = document.querySelectorAll('[name=project_deadline]');
const projectStatusInput = document.querySelector('[name=project_status]');
const projectDescrInputs = document.querySelectorAll('[name=project_description]');
const teamNameInputs = document.querySelectorAll('[name=team_name]');
const radios = document.querySelectorAll('[name=team_radio]');

// ПОЛУЧЕНИЕ CSRF ТОКЕНА ИЗ COOKIE
function getCSRFToken() {
    return document.cookie.split(';').find((pair) => pair.includes('csrftoken')).split('=')[1]
}

// УДАЛЕНИЕ ПРОЕКТА
document.addEventListener('DOMContentLoaded', () => {
    let deleteTeamBtns = document.querySelectorAll('.deleteProjectBtn');
    const modalDelete = new bootstrap.Modal(document.querySelector('#delete-project'));
    deleteTeamBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let span = document.querySelector('#deleteProjectForm span');
            let projectIdInput = deleteProjectForm.querySelector('[name=project_id]');
            span.innerHTML = e.currentTarget.dataset.projectName;
            projectIdInput.value = e.currentTarget.dataset.projectId;
            modalDelete.show();
        })
    })
});

// ДЕЙСТВИЯ ПО ВЫБОРУ RADIO
function changeRadio(action) {
    let form;
    if (action == 'create-project') {
        form = createProjectForm;
    } else {
        form = editProjectForm;
    }

    if (form.querySelector('.pass-radio').checked) {
        form.querySelector('[name=project_team_id]').value = '';
        form.querySelector('.project-teams-text').style.display = 'none';
        if (form.querySelector('.project-team')) {
            form.querySelector('.project-team').remove();
        }
        clearSearchResults(form);
        form.querySelector('.search-team-form').style.display = 'none';
    } else {
        form.querySelector('.search-team-form').style.display = 'block';
    }
}

radios.forEach(radio => radio.addEventListener('change', () => {
        changeRadio(radio.dataset.action);
    })
);

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

editProjectForm.querySelector('[name=project_technical_task').addEventListener('change', () => {
        checkInputs('edit-project');
});


projectDeadlineInputs.forEach(input => input.addEventListener('input', () => {
        checkInputs(input.dataset.action);
    })
);

projectStatusInput.addEventListener('change', () => {
    checkInputs('edit-project');
});

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

    let token = getCSRFToken();
    let teamName = form.querySelector('[name=team_name]').value;
    let projectTeamId = form.querySelector('[name=project_team_id]').value;

    let formData = new FormData();
    formData.append('action', 'search_team');
    formData.append('team_name', teamName);

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
    form.querySelector('[name=team_name]').value = '';
    form.querySelector('.search-team-btn').removeEventListener('click', searchTeam);
    form.querySelector('.search-team-btn').classList.add('grey-btn');
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
    let token = getCSRFToken();
    let projectName = createProjectForm.querySelector('[name=project_name]').value;
    let projectDeadline = createProjectForm.querySelector('[name=project_deadline]').value;
    let projectDescription = createProjectForm.querySelector('[name=project_description]').value;
    let projectTechnicalTask = createProjectForm.querySelector('[name=project_technical_task]').files[0];
    let projectTeamId = createProjectForm.querySelector('[name=project_team_id]').value;

    console.log(projectTechnicalTask);

    let formData = new FormData();
    formData.append('action', 'create_project');
    formData.append('project_name', projectName);
    formData.append('project_deadline', projectDeadline);
    formData.append('project_description', projectDescription);

    if (projectTechnicalTask) {
        formData.append('project_technical_task', projectTechnicalTask, projectTechnicalTask.name);
    }

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

// ВСТАВКА ДАННЫХ О ПРОЕКТЕ ДЛЯ РЕДАКТИРОВАНИЯ
editProjectBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        let token = getCSRFToken();
        let projectId = e.currentTarget.dataset.projectId;

        let formData = new FormData();
        formData.append('action', 'get_project_info');
        formData.append('project_id', projectId);

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
                editProjectForm.querySelector('[name=project_id]').value = projectId;
                editProjectForm.querySelector('[name=project_name]').value = data.name;
                editProjectForm.querySelector('[name=project_deadline]').value = data.deadline;
                editProjectForm.querySelector('[name=project_status]').value = data.status;
                editProjectForm.querySelector('[name=project_description]').value = data.description

                if (data.technical_task_name) {
                    let dt  = new DataTransfer();
                    dt.items.add(new File([], data.technical_task_name));
                    editProjectForm.querySelector('[name=project_technical_task]').files = dt.files;
                } else {
                    let dt  = new DataTransfer();
                    editProjectForm.querySelector('[name=project_technical_task]').files = dt.files;
                }

                if (data.team) {
                    editProjectForm.querySelector('.attach-radio').checked = true;
                    changeRadio('edit-project');

                    let teamElement = document.createElement('div');
                    teamElement.dataset.teamId = data.team.id;
                    teamElement.classList.add('project-team', 'd-flex', 'justify-content-between', 'align-items-center');
                    teamElement.style.width = '80%';
                    teamElement.style.border = '2px solid orange';

                    let name = document.createElement('p');
                    name.innerHTML = data.team.name;

                    let button = document.createElement('button');
                    button.innerHTML = 'Открепить';
                    button.classList.add('detach-team-btn', 'orange-btn');
                    button.dataset.action = 'edit-project';
                    button.addEventListener('click', detachTeam);

                    teamElement.appendChild(name);
                    teamElement.appendChild(button);

                    let projectTeam = editProjectForm.querySelector('.project-team');
                    if (projectTeam) {
                        projectTeam.remove();
                    }

                    editProjectForm.querySelector('.project-teams-text').style.display = 'block';
                    editProjectForm.querySelector('.project-teams').appendChild(teamElement);
                    editProjectForm.querySelector('[name=project_team_id]').value = data.team.id;
                } else {
                    editProjectForm.querySelector('.pass-radio').checked = true;
                    changeRadio('edit-project');
                }
            });
    });
});

// РЕДАКТИРОВАНИЕ ПРОЕКТА
function editProject() {
    let token = getCSRFToken();
    let projectId = editProjectForm.querySelector('[name=project_id]').value;
    let projectName = editProjectForm.querySelector('[name=project_name]').value;
    let projectTechnicalTask = editProjectForm.querySelector('[name=project_technical_task]').files[0];
    let projectDeadline = editProjectForm.querySelector('[name=project_deadline]').value;
    let projectStatus = editProjectForm.querySelector('[name=project_status]').value;
    let projectDescription = editProjectForm.querySelector('[name=project_description]').value;
    let projectTeamId = editProjectForm.querySelector('[name=project_team_id]').value;

    let formData = new FormData();
    formData.append('action', 'edit_project');
    formData.append('project_id', projectId);
    formData.append('project_name', projectName);

    if (projectTechnicalTask) {
        formData.append('project_technical_task', projectTechnicalTask, projectTechnicalTask.name);
    }

    formData.append('project_deadline', projectDeadline);
    formData.append('project_status', projectStatus);
    formData.append('project_description', projectDescription);

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

// РЕДАКТИРОВАНИЕ ПРОЕКТА
//document.addEventListener('DOMContentLoaded', () => {
//    let updateTeamBtns = document.querySelectorAll('.edit-project-btn');
//    const modalUpdate = new bootstrap.Modal(document.querySelector('#edit-project'));
//    updateTeamBtns.forEach((btn) => {
//        btn.addEventListener('click', (e) => {
//            modalUpdate.show();
//        })
//    })
//});


// ПОКАЗ ВСПЛЫВАЮЩЕГО ОКНА СО ВСЕЙ КОМАНДОЙ
//let btnsCloseAllTeam = document.querySelectorAll('.close-block-team-btn');
//let btnsShowAllTeams = document.querySelectorAll('.show-all-teams-btn');
//
//const countPersonInTeam = document.querySelector('#content__team').childNodes.length-1;
//btnsShowAllTeams.forEach(btn => {
//
//    if (countPersonInTeam <= 5) {
//        btn.style.display = "none";
//    } else {
//        btn.style.display = "block";
//        console.log(document.querySelector('.all-person-list').childNodes.length);
//        document.querySelector('#count-person').innerHTML = document.querySelector('.all-person-list').childNodes.length;
//    }
//
//    btn.addEventListener('click', (e) => {
//        let items = document.querySelectorAll('.all-person')[0];
//        items.classList.add("show-all-team");
//    })
//});
//
//btnsCloseAllTeam.forEach(function (btn) {
//    btn.addEventListener('click', (e) => {
//        let items = document.querySelectorAll('.all-person')[0];
//        items.classList.remove("show-all-team");
//    })
//});