/**
 * Data Store - локальное хранилище для моделей
 * Включает: услуги, пользователи (мастера, операторы, клиенты), смены
 */

// ============= SERVICES (Услуги) =============
export function getServices() {
  try {
    const data = localStorage.getItem('services');
    const parsed = data ? JSON.parse(data) : [];
    if (!parsed || parsed.length === 0) {
      // seed popular default services for new installs
      const defaults = [
        { id: 1001, name: 'Замена масла', price: 1500, createdAt: new Date().toISOString() },
        { id: 1002, name: 'Замена тормозных колодок', price: 3000, createdAt: new Date().toISOString() },
        { id: 1003, name: 'Диагностика двигателя', price: 1200, createdAt: new Date().toISOString() },
        { id: 1004, name: 'Заправка кондиционера', price: 2500, createdAt: new Date().toISOString() },
        { id: 1005, name: 'Полировка кузова', price: 4000, createdAt: new Date().toISOString() }
      ];
      saveServices(defaults);
      return defaults;
    }
    return parsed;
  } catch (err) {
    console.warn('Error loading services', err);
    return [];
  }
}

export function saveServices(services) {
  try {
    localStorage.setItem('services', JSON.stringify(services));
  } catch (err) {
    console.warn('Error saving services', err);
  }
}

export function addService(service) {
  const services = getServices();
  const newService = {
    id: Date.now(),
    name: service.name || '',
    price: Number(service.price) || 0,
    createdAt: new Date().toISOString()
  };
  services.push(newService);
  saveServices(services);
  return newService;
}

export function updateService(id, updates) {
  const services = getServices();
  const service = services.find(s => s.id === id);
  if (service) {
    Object.assign(service, updates);
    saveServices(services);
  }
  return service;
}

export function deleteService(id) {
  const services = getServices();
  const filtered = services.filter(s => s.id !== id);
  saveServices(filtered);
}

// ============= USERS (Пользователи) =============
export function getUsers() {
  try {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Error loading users', err);
    return [];
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (err) {
    console.warn('Error saving users', err);
  }
}

export function addUser(user) {
  const users = getUsers();
  const newUser = {
    id: Date.now(),
    name: user.name || '',
    role: user.role || 'client', // 'operator', 'master', 'client'
    services: user.services || [], // Для мастеров: array of service IDs
    currentShift: user.currentShift || null, // Для операторов: shift ID
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (user) {
    Object.assign(user, updates);
    saveUsers(users);
  }
  return user;
}

export function deleteUser(id) {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  saveUsers(filtered);
}

export function getOperators() {
  return getUsers().filter(u => u.role === 'operator');
}

export function getMasters() {
  return getUsers().filter(u => u.role === 'master');
}

export function getClients() {
  return getUsers().filter(u => u.role === 'client');
}

// ============= SHIFTS (Смены) =============
export function getShifts() {
  try {
    const data = localStorage.getItem('shifts');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Error loading shifts', err);
    return [];
  }
}

export function saveShifts(shifts) {
  try {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  } catch (err) {
    console.warn('Error saving shifts', err);
  }
}

export function openShift(operatorId) {
  const shifts = getShifts();
  
  // Проверка: нет ли уже открытой смены
  const activeShift = shifts.find(s => s.operatorId === operatorId && !s.closedAt);
  if (activeShift) {
    console.warn('Operator already has an active shift');
    return null;
  }

  const newShift = {
    id: Date.now(),
    operatorId: operatorId,
    openedAt: new Date().toISOString(),
    closedAt: null,
    notes: '',
    revenue: 0
  };
  
  shifts.push(newShift);
  saveShifts(shifts);

  // Обновить текущую смену оператора
  updateUser(operatorId, { currentShift: newShift.id });

  return newShift;
}

export function closeShift(shiftId, notes = '') {
  const shifts = getShifts();
  const shift = shifts.find(s => s.id === shiftId);
  
  if (shift && !shift.closedAt) {
    shift.closedAt = new Date().toISOString();
    shift.notes = notes;
    saveShifts(shifts);

    // Очистить текущую смену оператора
    updateUser(shift.operatorId, { currentShift: null });

    return shift;
  }
  return null;
}

export function getCurrentShift(operatorId) {
  const shifts = getShifts();
  return shifts.find(s => s.operatorId === operatorId && !s.closedAt) || null;
}

export function getShiftsByOperator(operatorId) {
  const shifts = getShifts();
  return shifts.filter(s => s.operatorId === operatorId).sort((a, b) => 
    new Date(b.openedAt) - new Date(a.openedAt)
  );
}

export function addShiftRevenue(shiftId, amount) {
  const shifts = getShifts();
  const shift = shifts.find(s => s.id === shiftId);
  if (shift && !shift.closedAt) {
    shift.revenue = (shift.revenue || 0) + Number(amount);
    saveShifts(shifts);
  }
  return shift;
}
