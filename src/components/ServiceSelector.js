import { useState, useEffect } from 'react';

export default function ServiceSelector({ 
  services = [], 
  value = '', 
  onChange, 
  required = false,
  disabled = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Если value это ID услуги, найдем её название
    if (value) {
      const service = services.find(s => String(s.id) === String(value));
      setInputValue(service ? service.name : value);
    } else {
      setInputValue('');
    }
  }, [value, services]);

  useEffect(() => {
    const currentInputValue = (inputValue || '').toString();
    if (currentInputValue.trim() === '') {
      setFilteredServices(services);
      setError('');
    } else {
      const filtered = services.filter(service => 
        service.name.toLowerCase().includes(currentInputValue.toLowerCase())
      );
      setFilteredServices(filtered);
      
      // Проверяем, существует ли точно такая услуга (по названию)
      const exactMatch = services.find(service => 
        service.name.toLowerCase() === currentInputValue.toLowerCase()
      );
      
      if (!exactMatch && filtered.length === 0) {
        setError('Такой услуги нет в списке');
      } else {
        setError('');
      }
    }
  }, [inputValue, services]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    
    // Если введенное значение точно совпадает с названием услуги, передаем ID
    const exactMatch = services.find(service => 
      service.name.toLowerCase() === newValue.toLowerCase()
    );
    
    if (exactMatch) {
      onChange && onChange(exactMatch.id);
    } else {
      onChange && onChange(newValue);
    }
  };

  const handleServiceSelect = (service) => {
    setInputValue(service.name);
    setShowDropdown(false);
    setError('');
    onChange && onChange(service.id); // Передаем ID услуги, а не имя
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Задержка для обработки клика по элементу выпадающего списка
    setTimeout(() => setShowDropdown(false), 0);
  };

  return (
    <div className="service-selector">
      <label>Услуга:</label>
      <div className="service-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Введите название услуги или выберите из списка"
          required={required}
          disabled={disabled}
          className="service-input"
          style={{
            borderColor: error ? 'var(--error-color)' : 'var(--border-color)'
          }}
        />
        {showDropdown && filteredServices.length > 0 && (
          <div className="service-dropdown">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="service-option"
                onMouseDown={() => handleServiceSelect(service)}
              >
                {service.name} — {service.price} ₽
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="service-error" style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
          ⚠️ {error}
        </div>
      )}
      {inputValue && !services.some(s => s.name.toLowerCase() === (inputValue || '').toString().toLowerCase()) && !error && (
        <div className="new-service-hint" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          💡 Услуга "{inputValue}" не найдена в списке
        </div>
      )}
    </div>
  );
}