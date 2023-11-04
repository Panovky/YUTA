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

btnOpenModal.addEventListener('click', () => {
    modal.show();
});

document.querySelector('#thumb').addEventListener('shown.bs.modal', () => {
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

    btnUpdateThumb.addEventListener('click', () => {
        const box = document.querySelector('.cropper-crop-box');
        const container = document.querySelector('.cropper-container')
        const styleBox = window.getComputedStyle(box);
        const styleContainer = window.getComputedStyle(container);

        let boxWidth = parseInt(styleBox.width);
        let boxHeight = parseInt(styleBox.height);
        let matrix = styleBox.transform || styleBox.mozTransform;
        let matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        let translateX = parseInt(matrixValues[4]);
        let translateY = parseInt(matrixValues[5]);
        let container_width = parseInt(styleContainer.width);
        let container_height = parseInt(styleContainer.height);

        updateMiniatureForm.width.value = boxWidth;
        updateMiniatureForm.height.value = boxHeight;
        updateMiniatureForm.container_width.value = container_width;
        updateMiniatureForm.container_height.value = container_height;
        updateMiniatureForm.delta_x.value = translateX;
        updateMiniatureForm.delta_y.value = translateY;

        modal.hide();
    })
});


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