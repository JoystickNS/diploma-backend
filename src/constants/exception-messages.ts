export const ExceptionMessages = {
  Forbidden: "Недостаточно прав",
  Unauthorized: "Пользователь не авторизован",
  IncorrectLoginOrPass: "Неверный логин или пароль",
  LoginAlreadyUsed: (login: string) =>
    `Пользователь с логином ${login} уже существует`,
  RoleNotFound: "У пользователя не найдена такая роль",
  InternalServer: "Произошла ошибка внутреннего сервера",
  StudentsNotFound: "Студенты не найдены",
  LessonTypeNotFound: "Не найден тип занятия",
};
