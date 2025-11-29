document.addEventListener('DOMContentLoaded', () => {
    // Получаем главный блок
    const card = document.getElementById('memberCard');

    // Небольшая задержка для корректного запуска анимации
    setTimeout(() => {
        // Добавляем класс 'animate', чтобы запустить все CSS переходы
        card.classList.add('animate');
    }, 100);
});