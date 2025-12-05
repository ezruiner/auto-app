import { useState, useEffect } from 'react';
import { getCarHistory, removeCarFromHistory, addCarToHistory } from '../store/dataStore';

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

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
    // Add to history only when user finishes typing (after blur)
    if (inputValue && inputValue.trim()) {
      addCarToHistory(inputValue.trim());
    }
  };

  const handleCarSelect = (car) => {
    setInputValue(car);
    setShowDropdown(false);
    onChange && onChange(car);
  };

  const handleRemoveCar = (carToRemove, e) => {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем выбор элемента
    removeCarFromHistory(carToRemove);
    // Refresh car history from localStorage to ensure consistency
    const updatedHistory = getCarHistory();
    setCarHistory(updatedHistory);
  };

  const handleFocus = () => {
    setShowDropdown(true);
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
          onBlur={handleInputBlur}
          placeholder="Введите марку и модель автомобиля"
          required={required}
          className="car-input"
        />
        {showDropdown && filteredCars.length > 0 && (
          <div className="car-dropdown">
            {filteredCars.map((car, index) => (
              <div
                key={`${car}-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCarSelect(car);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.2s ease',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  minHeight: '44px'
                }}
              >
                <span style={{ 
                  flex: 1, 
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginRight: '8px'
                }}>{car}</span>
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
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    opacity: '0.6'
                  }}
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