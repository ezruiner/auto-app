/**
 * Demo Data Seeder - заполнить приложение тестовыми данными
 * Используйте в консоли браузера для инициализации
 */

import { 
  addService, 
  addUser, 
  openShift,
  getOperators,
  getServices
} from '../store/dataStore';

export function seedDemoData() {
  // Очистить существующие данные (опционально)
  // localStorage.clear();

  // Добавить услуги
  const services = [
    { name: 'Замена масла', price: 1500 },
    { name: 'Замена тормозных колодок', price: 3000 },
    { name: 'Техническое обслуживание', price: 2500 },
    { name: 'Диагностика', price: 500 },
    { name: 'Протеркание фар', price: 800 },
    { name: 'Полировка кузова', price: 4000 }
  ];

  console.log('📦 Добавляю услуги...');
  const serviceIds = [];
  services.forEach(service => {
    const added = addService(service);
    serviceIds.push(added.id);
  });
  console.log(`✓ Добавлено ${services.length} услуг`);

  // Добавить мастеров с услугами
  console.log('👨‍🔧 Добавляю мастеров...');
  const masters = [
    { name: 'Иван Петров', role: 'master', services: [serviceIds[0], serviceIds[1], serviceIds[3]] },
    { name: 'Сергей Сидоров', role: 'master', services: [serviceIds[1], serviceIds[2], serviceIds[4]] },
    { name: 'Алексей Иванов', role: 'master', services: [serviceIds[0], serviceIds[3], serviceIds[5]] }
  ];

  masters.forEach(master => {
    addUser(master);
  });
  console.log(`✓ Добавлено ${masters.length} мастеров`);

  // Добавить операторов
  console.log('👨‍💼 Добавляю операторов...');
  const operators = [
    { name: 'Виктор Смирнов', role: 'operator' },
    { name: 'Елена Волкова', role: 'operator' },
    { name: 'Николай Соколов', role: 'operator' }
  ];

  const addedOperators = [];
  operators.forEach(operator => {
    const added = addUser(operator);
    addedOperators.push(added);
  });
  console.log(`✓ Добавлено ${operators.length} операторов`);

  // Добавить клиентов
  console.log('👤 Добавляю клиентов...');
  const clients = [
    { name: 'Александр Морозов', role: 'client' },
    { name: 'Ирина Лебедева', role: 'client' },
    { name: 'Дмитрий Козлов', role: 'client' }
  ];

  clients.forEach(client => {
    addUser(client);
  });
  console.log(`✓ Добавлено ${clients.length} клиентов`);

  // Открыть смену для первого оператора
  if (addedOperators.length > 0) {
    console.log('⏰ Открываю демо-смену...');
    openShift(addedOperators[0].id);
    console.log(`✓ Смена открыта для ${addedOperators[0].name}`);
  }

  console.log('\n✨ Демонстрационные данные успешно загружены!');
  console.log('📋 Перейдите в Администратор для просмотра');
}

// Для использования в консоли браузера:
// import { seedDemoData } from './utils/seedData';
// seedDemoData();
