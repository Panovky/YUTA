import requests
from YUTA.scripts import parse_lk
from projects.models import Project
from teams.models import Team
from users.models import User


def authorize_user(login: str, password: str) -> User | None:
    """
    Принимает логин и пароль пользователя и производит попытку его авторизации в приложении.

    Если пользователь не проходит авторизацию на сайте ЯГТУ, функция возвращает None.
    Если авторизация на сайте ЯГТУ успешна, функция возвращает объект User. Возможны два варианта:

    1. Новый пользователь приложения: для него создается запись в БД с информацией из его личного кабинета на сайте
    ЯГТУ (посредством парсинга html-страницы).

    2. Уже зарегистрированный в приложении пользователь: для него извлекается уже имеющаяся запись из базы данных.

    :param login: логин от учетной записи в приложении и на сайте ЯГТУ
    :type login: str
    :param password: пароль от учетной записи в приложении и на сайте ЯГТУ
    :type password: str
    :return: объект пользователя User или None
    :rtype: User | None
    """
    response = requests.post(
        'https://www.ystu.ru/WPROG/auth1.php',
        data={
            'login': login.strip(),
            'password': password.strip()
        }
    )

    if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
        return None

    if response.url == 'https://www.ystu.ru/WPROG/lk/lkstud.php':
        if User.objects.filter(login=login).exists():
            user = User.objects.get(login=login)
        else:
            data = parse_lk(response)
            user = User.objects.create(
                login=login,
                last_name=data.get('last_name'),
                first_name=data.get('first_name'),
                patronymic=data.get('patronymic'),
                birthday=data.get('birthday'),
                faculty=data.get('faculty'),
                direction=data.get('direction'),
                group=data.get('group')
            )

        return user


def edit_user_data(user: User, data: dict[str, str]) -> None:
    """
    Принимает объект пользователя и обновляет его данные из переданного словаря.

    Словарь с данными содержит: биографию, номер телефона, адрес электронной почты и ссылку на профиль ВКонтакте.
    Каждое значение словаря является строкой (может быть пустой или непустой, может иметь лишние пробелы и табуляции).
    Строка присваивается соответствующему атрибуту объекта, если она после удаления крайних пробелов и табуляций
    является непустой. Иначе атрибуту объекта присваивается None.

    :param user: объект пользователя User
    :type user: User
    :param data: словарь с данными о пользователе
    :type data: dict[str, str]
    :rtype: None
    """
    biography = data['biography'].strip()
    phone_number = data['phone_number'].strip()
    e_mail = data['e_mail'].strip()
    vk = data['vk'].strip()

    user.biography = biography if biography != '' else None
    user.phone_number = phone_number if phone_number != '' else None
    user.e_mail = e_mail if e_mail != '' else None
    user.vk = vk if vk != '' else None
    user.save()


def update_user_data(user: User, password: str) -> bool:
    """
    Принимает объект пользователя, его пароль и производит попытку синхронизации данных приложения и данных сайта ЯГТУ.

    Если указан неверный пароль от учетной записи, функция возвращает False.
    Если пароль верный, новые данные с html-страницы личного кабинета на сайте ЯГТУ, полученные посредством ее парсинга,
    записываются в атрибуты объекта пользователя, и функция возвращает True.

    :param user: объект пользователя User, чьи данные нужно синхронизировать
    :type user: User
    :param password: пароль от учетной записи в приложении и на сайте ЯГТУ
    :type password: str
    :return: True, если синхронизация данных прошла успешно, иначе False
    :rtype: bool
    """
    response = requests.post(
        'https://www.ystu.ru/WPROG/auth1.php',
        data={
            'login': user.login,
            'password': password.strip()
        }
    )

    if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
        return False

    if response.url == 'https://www.ystu.ru/WPROG/lk/lkstud.php':
        data = parse_lk(response)
        user.last_name = data.get('last_name')
        user.first_name = data.get('first_name')
        user.patronymic = data.get('patronymic')
        user.birthday = data.get('birthday')
        user.faculty = data.get('faculty')
        user.direction = data.get('direction')
        user.group = data.get('group')
        user.save()
        return True


def search_users(user_name: str, leader_id: int | None = None, members_id: list[int] | None = None) -> dict:
    """
    Осуществляет поиск пользователей по полному или неполному имени.

    Поиск в навбаре:
    - принимает только один параметр - поисковый запрос;
    - возвращает словарь со всеми совпадениями по пользователям.

    Поиск при создании команды:
    - принимает поисковый запрос, id руководителя команды и список id текущих участников команды;
    - возвращает словарь найденных пользователей, исключая руководителя команды и текущих участников команды.

    Если переданный поисковый запрос является пустой строкой или слов в переданном запросе больше 3, поиск невозможен:
    функция завершит работу с пустым результатом.

    :param user_name: поисковый запрос, имя (полное или неполное)
    :type user_name: str
    :param leader_id: идентификатор руководителя команды в БД (необязательный)
    :type leader_id: int | None
    :param members_id: список целых чисел - идентификаторов текущих участников команды в БД (необязательный)
    :type members_id: list[int] | None
    :return: словарь с информацией о найденных пользователях или словарь с пустым списком по ключу 'users', если
    пользователи не найдены
    :rtype: dict
    """
    user_name_parts = [word.capitalize() for word in user_name.strip().split()]

    if len(user_name_parts) == 0 or len(user_name_parts) > 3:
        return {'users': []}

    if len(user_name_parts) == 3:
        users = \
            User.objects.filter(last_name__startswith=user_name_parts[0]) & \
            User.objects.filter(first_name__startswith=user_name_parts[1]) & \
            User.objects.filter(patronymic__startswith=user_name_parts[2])
    elif len(user_name_parts) == 2:
        users = \
            User.objects.filter(last_name__startswith=user_name_parts[0]) & \
            User.objects.filter(first_name__startswith=user_name_parts[1]) | \
            User.objects.filter(first_name__startswith=user_name_parts[0]) & \
            User.objects.filter(last_name__startswith=user_name_parts[1]) | \
            User.objects.filter(first_name__startswith=user_name_parts[0]) & \
            User.objects.filter(patronymic__startswith=user_name_parts[1])
    else:
        users = \
            User.objects.filter(last_name__startswith=user_name_parts[0]) | \
            User.objects.filter(first_name__startswith=user_name_parts[0]) | \
            User.objects.filter(patronymic__startswith=user_name_parts[0])

    if leader_id:
        users = users.exclude(id=leader_id)

    if members_id:
        users = users.exclude(id__in=members_id)

    return {
        'users': [
            {
                'id': user.id,
                'cropped_photo_url': user.cropped_photo.url,
                'last_name': user.last_name,
                'first_name': user.first_name,
                'patronymic': user.patronymic,
            }
            for user in users
        ]
    }


def get_team_info(team_id: int) -> dict:
    """
    Принимает id команды в базе данных и возвращает словарь с информацией об этой команде.

    :param team_id: идентификатор команды в базе данных
    :type team_id: int
    :return: словарь с информацией о команде
    :rtype: dict
    """
    team = Team.objects.get(id=team_id)

    return {
        'name': team.name,
        'members': [
            {
                'id': member.id,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'patronymic': member.patronymic,
                'cropped_photo_url': member.cropped_photo.url
            }
            for member in team.members.all()
        ]
    }


def get_project_info(project_id: int) -> dict:
    """
    Принимает id проекта в базе данных и возвращает словарь с информацией об этом проекте.

    :param project_id: идентификатор проекта в базе данных
    :type project_id: int
    :return: словарь с информацией о проекте
    :rtype: dict
    """
    project = Project.objects.get(id=project_id)

    return {
        'name': project.name,
        'technical_task_url': project.technical_task.url if project.technical_task else None,
        'technical_task_name': project.technical_task.url.replace('/media/projects_technical_tasks/',
                                                                  '') if project.technical_task else None,
        'deadline': project.deadline,
        'status': project.status,
        'description': project.description,
        'team': {
            'id': project.team.id,
            'name': project.team.name
        } if project.team else None
    }


def is_team_name_unique(team_name: str, team_id: int | None = None) -> bool:
    """
    Принимает потенциальное название для команды и возвращает результат его проверки на уникальность.

    При создании команды передается только название, при редактировании команды - название и идентификатор команды.

    :param team_name: потенциальное имя команды для проверки на уникальность
    :type team_name: str
    :param team_id: идентификатор команды (необязательный параметр, нужен только при редактировании команды)
    :type team_id: int | None
    :return: True, если название команды уникально, иначе - False
    :rtype: bool
    """

    if team_id:
        if team_name == Team.objects.get(id=team_id).name:
            return True

    return not Team.objects.filter(name=team_name).exists()
