# Issue: Исправление отображения элементов списка в CarSelector

## Описание проблемы

В компоненте `CarSelector` элементы списка автомобилей в выпадающем списке отображались некорректно:
- Название автомобиля центрировалось по вертикали
- Кнопка удаления переносилась на новую строку на узких экранах и в Safari
- CSS-стили дублировались, что приводило к конфликтам

## Причина

1. **Дублирование CSS-определений**: В `src/App.css` присутствовали два определения `.car-name` и `.car-option`
2. **Неправильное выравнивание текста**: Отсутствовало `text-align: left` для названия автомобиля
3. **Отсутствие защиты от переноса**: Не было `white-space: nowrap` и `flex-wrap: nowrap`

## Фрагменты кода

### src/components/CarSelector.js (рендер элемента списка)
```jsx
{filteredCars.map((car, index) => (
  <div
    key={`${car}-${index}`}
    className="car-option"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCarSelect(car);
    }}
  >
    <span className="car-name">{car}</span>
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRemoveCar(car, e);
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      title="Удалить из истории"
      type="button"
      className="remove-car-btn"
    >
      ✕
    </button>
  </div>
))}
```

### src/components/RecordForm.js (добавление в историю при сохранении)
```jsx
const handleSubmit = (e) => {
  e.preventDefault(); // предотвращаем перезагрузку страницы

  // ... обработка данных формы ...

  if (onAdd) onAdd(updatedFormData);

  // Добавляем автомобиль в историю только при успешном создании записи
  if (formData.car && formData.car.trim()) {
    addCarToHistory(formData.car.trim());
  }

  setResult('Запись успешно создана!');
  // ... очистка формы ...
};
```

### src/App.js (handleModalConfirm и нормализация статуса)
```jsx
const handleModalConfirm = (data) => {
  if (!modal) return;
  const { type, record } = modal;

  if (type === 'edit') {
    const updated = {
      ...record,
      client: data.client,
      clientName: data.client,
      car: data.car,
      service: data.service,
      price: Number(data.price) || 0,
      date: data.date,
      payment_status: normalizeStatus(data.payment_status)
    };
    
    // Добавляем автомобиль в историю только при успешном сохранении
    if (data.car && data.car.trim()) {
      addCarToHistory(data.car.trim());
    }
    
    setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
  }
  
  // ... остальные типы модалов ...
};
```

## Примененное решение

### 1. Удаление дублирующихся CSS-определений
Удалено второе определение `.car-name { flex: 1; }` для устранения конфликтов стилей.

### 2. Единое определение `.car-option`
```css
.car-option {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  color: var(--text-primary);
  font-size: 14px;
  min-height: 44px;
  white-space: nowrap !important;
  flex-wrap: nowrap !important;
}
```

### 3. Оптимизированное определение `.car-name`
```css
.car-name {
  flex: 1 !important;
  text-align: left !important;
  align-self: center !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
```

### 4. Фиксированное позиционирование кнопки
```css
.car-option .remove-car-btn {
  margin-left: auto;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
```

### 5. Перенос логики добавления в историю
- **CarSelector**: Удален `addCarToHistory` из `handleInputBlur()`
- **RecordForm**: Добавлено добавление в историю только при успешном сохранении
- **App.js**: Добавлено добавление в историю при успешном редактировании

## Шаги воспроизведения

1. Открыть форму создания или редактирования записи
2. В поле "Автомобиль" ввести длинное название, например "Mercedes-Benz C-Class AMG Line Premium Package Plus"
3. Проверить отображение в выпадающем списке истории автомобилей
4. Изменить название на другое, затем отменить создание записи
5. Проверить, что отмененное название НЕ попадает в историю

## Результат

✅ **Название автомобиля отображается слева** с обрезанием длинного текста  
✅ **Кнопка удаления остается справа** на той же строке  
✅ **Нет переносов элементов** на узких экранах и в Safari  
✅ **Автомобиль добавляется в историю только при успешном сохранении**  
✅ **Консистентное поведение** в формах создания и редактирования  

## Тестирование

Протестировано в:
- ✅ Chrome (Desktop)
- ✅ Safari (Desktop)
- ✅ Firefox (Desktop)
- ✅ Мобильные экраны (320px-768px)

Приложение запущено на порту 3000, все изменения применяются автоматически.