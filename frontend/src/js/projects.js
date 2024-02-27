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

editProjectForm.querySelector('[name=project_technical_task]').addEventListener('change', () => {
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
    if (e.currentTarget.dataset.action == 'create-project') {
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
                teamElement.classList.add('searched-team');

                let name = document.createElement('p');
                name.classList.add('modal-text', 'text-start');
                name.innerHTML = team.name;

                let button = document.createElement('button');
                button.classList.add('attach-team-btn', 'add-team-in-project-btn');
                button.dataset.action = action;
                button.innerHTML = `
                    <svg class="attach-team-btn" data-action="create-project" width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M8.77778 15H15M15 15H21.2222M15 15V21.2222M15 15V8.77778M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
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
    if (e.currentTarget.dataset.action == 'create-project') {
        form = createProjectForm;
        action = 'create-project';
    } else {
        form = editProjectForm;
        action = 'edit-project';
    }

    let chosenTeam = e.currentTarget.parentElement;

    let teamElement = document.createElement('div');
    teamElement.dataset.teamId = chosenTeam.dataset.teamId;
    teamElement.classList.add('project-team');

    let name = document.createElement('p');
    name.classList.add('modal-text', 'text-start');
    name.innerHTML = chosenTeam.querySelector('p').innerHTML;

    let button = document.createElement('button');
    button.classList.add('detach-team-btn', 'add-team-in-project-btn');
    button.dataset.action = action;
    button.innerHTML = `
        <svg width="28" height="28" class="detach-team-btn" data-action="create-project" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M8.77778 15H21.2222M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

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
    if (e.currentTarget.dataset.action == 'create-project') {
        form = createProjectForm;
        action = 'create-project';
    } else {
        form = editProjectForm;
        action = 'edit-project';
    }

    e.currentTarget.parentElement.remove();
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

                if (data.technical_task_url) {
                    async function addTechnicalTaskFile(url, name){
                        let response = await fetch(url);
                        let data = await response.blob();
                        let metadata = {
                            type: 'file/pdf'
                        };
                        let file = new File([data], name, metadata);
                        let dt  = new DataTransfer();
                        dt.items.add(file);
                        editProjectForm.querySelector('[name=project_technical_task]').files = dt.files;
                        editProjectForm.querySelector('.input-file-text').innerHTML = name;
                    }

                    addTechnicalTaskFile(data.technical_task_url, data.technical_task_name);
                }

                if (data.team) {
                    editProjectForm.querySelector('.attach-radio').checked = true;
                    changeRadio('edit-project');

                    let teamElement = document.createElement('div');
                    teamElement.dataset.teamId = data.team.id;
                    teamElement.classList.add('project-team');

                    let name = document.createElement('p');
                    name.classList.add('modal-text', 'text-start');
                    name.innerHTML = data.team.name;

                    let button = document.createElement('button');
                    button.classList.add('detach-team-btn', 'add-team-in-project-btn');
                    button.dataset.action = 'edit-project';
                    button.innerHTML = `
                        <svg width="28" height="28" class="detach-team-btn" data-action="edit-project" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M8.77778 15H21.2222M15 29C13.1615 29 11.341 28.6379 9.64243 27.9343C7.94387 27.2307 6.40053 26.1995 5.10051 24.8995C3.80048 23.5995 2.76925 22.0561 2.06569 20.3576C1.36212 18.659 1 16.8385 1 15C1 13.1615 1.36212 11.341 2.06569 9.64243C2.76925 7.94387 3.80048 6.40053 5.10051 5.1005C6.40053 3.80048 7.94387 2.76925 9.64243 2.06569C11.341 1.36212 13.1615 1 15 1C18.713 1 22.274 2.475 24.8995 5.1005C27.525 7.72601 29 11.287 29 15C29 18.713 27.525 22.274 24.8995 24.8995C22.274 27.525 18.713 29 15 29Z" stroke="#D96A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `;
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


// ПОКАЗ МОДАЛЬНОГО ОКНА СОЗДАНИЯ ПРОЕКТА
document.addEventListener('DOMContentLoaded', () => {
    const createProjectBtn = document.querySelector('#createProjectBtn');
    const modalCreate = new bootstrap.Modal(document.querySelector('#create-project'));

    createProjectBtn.addEventListener('click', (e) => {
        modalCreate.show();

        document.querySelectorAll('.empty-results-text').forEach(item => {
            item.style.display = 'none';
        });

        document.querySelectorAll('.project-teams-text').forEach(item => {
            item.style.display = 'none';
        });

        projectNameInputs.forEach(item => {
            item.value = '';
        });

        projectDeadlineInputs.forEach(item => {
            item.value = '';
        });

        projectDescrInputs.forEach(item => {
            item.value = '';
        });

        document.querySelectorAll('.input-file-text').forEach(item => {
            item.innerHTML = '';
        });

        document.querySelectorAll('.project-teams').forEach(item => {
            item.innerHTML = '';
        });

        document.querySelectorAll('.searched-teams').forEach(item => {
            item.innerHTML = '';
        });
    })
});


// ПОКАЗ МОДАЛЬНОГО ОКНА РЕДАКТИРОВАНИЯ ПРОЕКТА
document.addEventListener('DOMContentLoaded', () => {
   let updateTeamBtns = document.querySelectorAll('.edit-project-btn');
   const modalUpdate = new bootstrap.Modal(document.querySelector('#edit-project'));
   updateTeamBtns.forEach((btn) => {
       btn.addEventListener('click', (e) => {
           modalUpdate.show();

           document.querySelectorAll('.empty-results-text').forEach(item => {
               item.style.display = 'none';
           });
       })
   })
});


// ПОКАЗ ВСПЛЫВАЮЩЕГО ОКНА СО ВСЕЙ КОМАНДОЙ
const btnsCloseAllTeam = document.querySelectorAll('.close-block-team-btn');
const btnsShowAllTeams = document.querySelectorAll('.show-all-teams-btn');
const countPersonInTeam = document.querySelectorAll('.content__team');
const allPersonBlock = document.querySelectorAll('.all-person');
let countPerson = [];

countPersonInTeam.forEach(item => {
    let PersonArray = item. querySelectorAll('.team-item');
    countPerson.push(PersonArray.length);
})

btnsShowAllTeams.forEach((btn, index) => {
    let currentTeam = countPersonInTeam[index];
    if (countPerson[index] <= 4) {
        btn.style.display = "none";
        allPersonBlock[index].style.display = "none";
    } else {
        for (let i = countPerson[index]-1; i > 2 ; i--) {
            currentTeam.querySelectorAll('.team-item')[i].style.display = "none";
        }
        btn.style.display = "block";
        allPersonBlock[index].style.display = "block";

        let arrayPersonInAllTeamBlock = document.querySelectorAll('.all-person-list')[index];
        document.querySelectorAll('.count-person')[index].innerHTML = (arrayPersonInAllTeamBlock.querySelectorAll('a').length)-3;
    }

    btn.addEventListener('click', (event) => {
        allPersonBlock[index].classList.add("show-all-team");
    })
});

btnsCloseAllTeam.forEach((btn, index) => {
    btn.addEventListener('click', (event) => {
        allPersonBlock[index].classList.remove("show-all-team");
    })
});

// УДАЛЕНИЕ ТЗ ИЗ ФОРМЫ
document.querySelectorAll('.deleteTzBtn').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.tzInput').forEach(field => {
            field.value = '';
        })
        document.querySelectorAll('.input-file-text').forEach(field => {
            field.innerHTML = '';
        })
        editProjectBtn.classList.remove('grey-btn');
        checkInputs('edit-form');
    });
})

// ПОКАЗ НАЗВАНИЯ ЗАГРУЖЕННОГО ФАЙЛА
document.querySelectorAll('.tzInput').forEach(item => {
    item.addEventListener('change', (e) => {
        let filename = e.target.files[0].name;
        document.querySelectorAll('.input-file-text').forEach(item => {
            item.innerHTML = `<div>${filename}</div>`;
        })
    })
});
