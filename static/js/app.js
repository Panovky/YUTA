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
const imageCur = document.querySelector('#image');
const cropper = new Cropper(imageCur, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 0.65,
    zoomable: false,
    guides: true,
    background: false,
})

document.querySelector('#cropImageBtn').addEventListener('click', () => {
    let croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
    document.querySelector('#outputThumb').src = croppedImage;
})

document.querySelector('#openThumbModal').addEventListener('click', () => {
    let croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
    document.querySelector('#outputThumb').src = croppedImage;
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