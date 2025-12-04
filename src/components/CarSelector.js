import { useState, useEffect } from 'react';
import { getCarHistory, removeCarFromHistory } from '../store/dataStore';

export default function CarSelector({ 
  value = '', 
  onChange, 
  required = false 
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [carHistory, setCarHistory] = useState([]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    // Загружаем историю автомобилей из localStorage
    const history = getCarHistory();
    setCarHistory(history);
  }, []);

  const currentInputValue = (inputValue || '').toString();
  const filteredCars = currentInputValue.trim() === '' 
    ? carHistory 
    : carHistory.filter(car => 
        car.toLowerCase().includes(currentInputValue.toLowerCase())
      );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    onChange && onChange(newValue);
  };

  const handleCarSelect = (car) => {
    setInputValue(car);
    setShowDropdown(false);
    onChange && onChange(car);
  };

  const handleRemoveCar = (carToRemove, e) => {
    e.stopPropagation(); // Предотвращаем выбор элемента
    removeCarFromHistory(carToRemove);
    // Refresh car history from localStorage to ensure consistency
    const updatedHistory = getCarHistory();
    setCarHistory(updatedHistory);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="car-selector">
      <label>Автомобиль:</label>
      <div className="car-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Введите марку и модель автомобиля"
          required={required}
          className="car-input"
        />
        {showDropdown && filteredCars.length > 0 && (
          <div className="car-dropdown">
            {filteredCars.map((car, index) => (
              <div
                key={`${car}-${index}`}
                className="car-option"
                onMouseDown={() => handleCarSelect(car)}
              >
                <span className="car-name">{car}</span>
                <button
                  className="remove-car-btn"
                  onClick={(e) => handleRemoveCar(car, e)}
                  title="Удалить из истории"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {inputValue && !carHistory.some(c => c.toLowerCase() === inputValue.toLowerCase()) && (
        <div className="new-car-hint">
          💡 Будет добавлен в историю: "{inputValue}"
        </div>
      )}
    </div>
  );
}