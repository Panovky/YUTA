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
