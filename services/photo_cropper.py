from PIL import Image


def crop_photo(open_path: str, save_path: str, container_size: tuple[int, int], width: int, height: int, delta_x: int,
               delta_y: int) -> None:
    """
    Принимает путь к фотографии, обрезает ее согласно переданным параметрам и сохраняет ее по указанному пути.

    :param open_path: путь к фотографии, которую необходимо обрезать
    :type open_path: str
    :param save_path: путь, по которому нужно сохранить обрезанную фотографию
    :type save_path: str
    :param container_size: кортеж (c_width, c_height) с шириной и высотой контейнера, в котором лежит фотография
    :type container_size: tuple[int, int]
    :param width: ширина выбранной области фотографии
    :type width: int
    :param height: высота выбранной области фотографии
    :type height: int
    :param delta_x: смещение выбранной области от левого края фотографии
    :type delta_x: int
    :param delta_y: смещение выбранной области от верхнего края фотографии
    :type delta_y: int
    :rtype: None
    """
    photo = Image.open(open_path)
    coef = photo.size[0] / container_size[0]
    width = int(width * coef)
    height = int(height * coef)
    delta_x = int(delta_x * coef)
    delta_y = int(delta_y * coef)
    photo = photo.crop((delta_x, delta_y, delta_x + width, delta_y + height))
    photo.save(save_path)
