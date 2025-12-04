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
    // Check if this is an operator and role is being changed (not just name or other fields)
    const isRoleChange = updates.role !== undefined && updates.role !== user.role;
    const isOperator = user.role === 'operator';

    // Only close shift if the ROLE is actually changing, not other fields like name
    if (isOperator && isRoleChange) {
      const currentShift = getCurrentShift(user.id);
      if (currentShift) {
        // Automatically close the shift when role changes
        closeShift(currentShift.id, `Автоматическое закрытие: изменение роли пользователя с ${user.role} на ${updates.role || 'неопределено'}`);
        // Ensure currentShift is set to null in the updates
        updates.currentShift = null;
      }
    }

    Object.assign(user, updates);
    saveUsers(users);
  }
  return user;
}

export function deleteUser(id) {
  const users = getUsers();
  const userToDelete = users.find(u => u.id === id);

  // If the user being deleted is an operator with an open shift, close it first
  if (userToDelete && userToDelete.role === 'operator') {
    const currentShift = getCurrentShift(userToDelete.id);
    if (currentShift) {
      // Automatically close the shift with a deletion comment
      closeShift(currentShift.id, `Автоматическое закрытие: пользователь удалён`);
    }
  }

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

/**
 * Clean up orphaned shifts - shifts that belong to operators who no longer exist
 * This handles cases where operators were deleted before automatic shift closing was implemented
 */
export function cleanupOrphanedShifts() {
  const shifts = getShifts();
  const users = getUsers();
  const userIds = users.map(u => u.id);

  let cleanedUp = false;

  shifts.forEach(shift => {
    // If shift is open and belongs to a non-existent operator
    if (!shift.closedAt && !userIds.includes(shift.operatorId)) {
      // Close the orphaned shift
      shift.closedAt = new Date().toISOString();
      shift.notes = `Автоматическое закрытие: оператор удалён (очистка данных)`;
      cleanedUp = true;
    }
  });

  if (cleanedUp) {
    saveShifts(shifts);
  }

  return cleanedUp;
}
