// УСТАНОВКА НОВОЙ ФОТОГРАФИИ НА АВАТАРКУ
let newImage = document.querySelector('#output');

document.querySelector('#inputImg').addEventListener('change', (event) => {
    newImage.src = URL.createObjectURL(event.target.files[0]);
})

document.querySelector('#deleteFotoBtn').addEventListener('click', () => {
    newImage.src = newImage.dataset.src;
    inputField.value = '';
})

document.querySelector('#choiceAvatartBtn').addEventListener('click', () => {
    newImage.src = newImage.dataset.src;
    inputField.value = '';
})



// ИЗМЕНЕНИЕ МИНИАТЮРЫ АВАТАРКИ
const btnOpenModal = document.querySelector('#openThumbModal');
const btnUpdateThumb = document.querySelector('#btnUpdateThumb');
const modal = new bootstrap.Modal(document.querySelector('#thumb'));
btnOpenModal.addEventListener('click', ()=> {
    modal.show();
});

document.querySelector('#thumb').addEventListener('shown.bs.modal', ()=> {
    const image = document.querySelector('#imageCrop');

    document.querySelector(".preview").style.cssText = `
		width: 180px;
		height: 180px;
		border-radius: 50%;
		overflow: hidden;
	`;

    const cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 2,
        autoCropArea: 0.65,
        guides: true,
        background: false,
        zoomable: false,
        scalable: false,
        enforceBoundary: false,
        enableExif: true,
        preview: '.preview',
    });
});

btnUpdateThumb.addEventListener('click', ()=> {
    const imageNew = document.querySelector(".preview").childNodes[0];
    const imageCrop = document.querySelector(".wrapperCrop").childNodes[0];
})



// ВСПЛЫВАЮЩИЕ ПОДСКАЗКИ
tippy('#editButton', {
    content: 'Редактировать профиль',
    placement: 'top-end',
    animation: 'scale',
    theme: 'material',
});

tippy('#reloadButton', {
    content: 'Обновить данные профиля с сайта ЯГТУ',
    placement: 'top-end',
    animation: 'scale',
    theme: 'material',
});


// МАСКА ДЛЯ ВВОДА НОМЕРА ТЕЛЕФОНА
const phoneInput = document.querySelector('.phone');
const mask = new IMask(phoneInput, {
    mask: "+{7} (000) 000-00-00"
});