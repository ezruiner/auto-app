import { useState, useEffect } from 'react';

export default function MasterSelector({ 
  masters = [], 
  value = '', 
  onChange, 
  required = false,
  disabled = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const currentInputValue = (inputValue || '').toString();
    if (currentInputValue.trim() === '') {
      setFilteredMasters(masters);
      setError('');
    } else {
      const filtered = masters.filter(master => 
        master.name.toLowerCase().includes(currentInputValue.toLowerCase())
      );
      setFilteredMasters(filtered);
      
      // Проверяем, существует ли точно такой мастер
      const exactMatch = masters.find(master => 
        master.name.toLowerCase() === currentInputValue.toLowerCase()
      );
      
      if (!exactMatch && filtered.length === 0) {
        setError('Такого мастера нет в списке');
      } else {
        setError('');
      }
    }
  }, [inputValue, masters]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    onChange && onChange(newValue);
  };

  const handleMasterSelect = (master) => {
    setInputValue(master.name);
    setShowDropdown(false);
    setError('');
    onChange && onChange(master.name);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Задержка для обработки клика по элементу выпадающего списка
    setTimeout(() => setShowDropdown(false), 0);
  };

  return (
    <div className="master-selector">
      <label htmlFor="master-input">Мастер:</label>
      <div className="master-input-container">
        <input
          id="master-input"
          name="master"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Введите имя мастера или выберите из списка"
          required={required}
          disabled={disabled}
          className="master-input"
          style={{
            borderColor: error ? 'var(--error-color)' : 'var(--border-color)'
          }}
        />
        {showDropdown && filteredMasters.length > 0 && (
          <div className="master-dropdown">
            {filteredMasters.map(master => (
              <div
                key={master.id}
                className="master-option"
                onMouseDown={() => handleMasterSelect(master)}
              >
                {master.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="master-error" style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
          ⚠️ {error}
        </div>
      )}
      {inputValue && !masters.some(m => m.name.toLowerCase() === (inputValue || '').toString().toLowerCase()) && !error && (
        <div className="new-master-hint" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          💡 Мастер "{inputValue}" не найден в списке
        </div>
      )}
    </div>
  );
}