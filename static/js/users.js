// ОБРАБОТКА ОШИБКИ МОДАЛКИ ОБНОВЛЕНИЯ ДАННЫХ
document.addEventListener("DOMContentLoaded", () => {
    const openModalReloadBtn = document.querySelector('#openModalReloadBtn');
    const modalReload = new bootstrap.Modal(document.querySelector('#reload'));
    const reloadForm = document.querySelector('#reloadForm');
    const inputPassword = document.querySelector('#Password');
    const authBtn = document.querySelector('#auth-btn');

    openModalReloadBtn.addEventListener('click', () => {
        modalReload.show()
    })

    if (reloadForm.contains(document.querySelector('#errorMessage'))) {
        modalReload.show()
    }

    reloadForm.addEventListener('input', () => {
        let isAnyFieldEmpty = [inputPassword].some(input => !input.value.trim());
        authBtn.disabled = isAnyFieldEmpty;
    })
});


// ИЗМЕНЕНИЕ ФОТОГРАФИИ АВАТАРКИ
const modalMiniature = new bootstrap.Modal(document.querySelector('#thumb'));
const modalChoice = new bootstrap.Modal(document.querySelector('#foto'));
const btnOpenModalChoice = document.querySelector('#openChiceFotoModal');
const btnOpenModalMiniature = document.querySelector('#openThumbModal');
const btnUpdateMiniature = document.querySelector('#btnUpdateThumb');
const deleteFotoBtn = document.querySelector('#deleteFotoBtn');

btnOpenModalChoice.addEventListener('click', () => {
    modalChoice.show();
    document.querySelector('#inputImg').value = '';
    document.querySelector('.input-file-list').style.display = 'none';
});

deleteFotoBtn.addEventListener('click', () => {
    document.querySelector('#inputImg').value = '';
    document.querySelector('.input-file-list').style.display = 'none';
});

document.querySelector('#inputImg').addEventListener('change', (event) => {
    document.querySelector('#output').src = URL.createObjectURL(event.target.files[0]);
    document.querySelector('.input-file-list').style.display = 'block';
})

updateFotoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let url = document.querySelector('.menu-link').href;
    let id = url.slice(-1);
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
    }
    fetch(`${id}`, {
        method: 'POST',
        body: new FormData(updateFotoForm),
        headers: headers,
    })
        .then(response => {
            modalChoice.hide();
            modalMiniature.show();
            return response.json();
        })
        .then(data => {
            decodeURIComponent(document.querySelector('#imageCrop').src = decodeURIComponent(data.photo_url));
        })
});


// ИЗМЕНЕНИЕ МИНИАТЮРЫ АВАТАРКИ
btnOpenModalMiniature.addEventListener('click', () => {
    modalMiniature.show();
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

    btnUpdateMiniature.addEventListener('click', () => {
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

        modalMiniature.hide();
    })
});


// ВСПЛЫВАЮЩИЕ ПОДСКАЗКИ
document.addEventListener("DOMContentLoaded", () => {
    tippy('#editButton', {
        content: 'Редактировать профиль',
        placement: 'top-end',
        animation: 'scale',
        theme: 'material',
    });

    tippy('#openModalReloadBtn', {
        content: 'Обновить данные профиля с сайта ЯГТУ',
        placement: 'top-end',
        animation: 'scale',
        theme: 'material',
    });
});


// МАСКА ДЛЯ ВВОДА НОМЕРА ТЕЛЕФОНА
document.addEventListener("DOMContentLoaded", () => {
    const phoneInput = document.querySelectorAll('.phone');
    const vkInput = document.querySelectorAll('.link-vk');

    phoneInput.forEach(item => {
        const maskPhone = new IMask(item, {
            mask: "+{7} (000) 000-00-00"
        });
    })

    vkInput.forEach(item => {
        const maskVk = new IMask(item, {
            mask: "{https://vk.com/}*[**********************************************]",
        });
    })
});
