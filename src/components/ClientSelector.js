import { useState, useEffect } from 'react';

export default function ClientSelector({ 
  clients = [], 
  value = '', 
  onChange, 
  required = false 
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const currentInputValue = (inputValue || '').toString();
    if (currentInputValue.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(currentInputValue.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [inputValue, clients]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    onChange && onChange(newValue);
  };

  const handleClientSelect = (client) => {
    setInputValue(client.name);
    setShowDropdown(false);
    onChange && onChange(client.name);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Задержка для обработки клика по элементу выпадающего списка
    setTimeout(() => setShowDropdown(false), 0);
  };

  return (
    <div className="client-selector">
      <label htmlFor="client-input">Клиент:</label>
      <div className="client-input-container">
        <input
          id="client-input"
          name="client"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Введите имя клиента или выберите из списка"
          required={required}
          className="client-input"
        />
        {showDropdown && filteredClients.length > 0 && (
          <div className="client-dropdown">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="client-option"
                onMouseDown={() => handleClientSelect(client)}
              >
                {client.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {(inputValue || '').toString() && !clients.some(c => c.name.toLowerCase() === (inputValue || '').toString().toLowerCase()) && (
        <div className="new-client-hint">
          💡 Будет создан новый клиент: "{inputValue}"
        </div>
      )}
    </div>
  );
}