import './App.css';
import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RecordList from './components/RecordList';
import RecordForm from  './components/RecordForm';
import Modal from './components/Modal';
import EditForm from './components/EditForm';
import DeleteForm from './components/DeleteForm';
import ConfirmForm from './components/ConfirmForm';
import ThemeToggle from './components/ThemeToggle';
import AdminPanel from './components/AdminPanel';
import ShiftsManagement from './components/ShiftsManagement';
import ServicesManagement from './components/ServicesManagement';
import UsersManagement from './components/UsersManagement';
import { getRecordCards } from './service/api';
import { getUsers, getServices, getMasters, addCarToHistory } from './store/dataStore';

function Navigation({ onOpenCreate }) {
  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="brand">🛠️ Автосервис Ultra Pro Max</Link>
        <Link to="/users" className="btn">Пользователи</Link>
        <Link to="/shifts" className="btn">Смены</Link>
        <Link to="/services" className="btn">Услуги</Link>
      </div>
      <div className="nav-right">
        <button className="btn primary" onClick={() => onOpenCreate()}>+ Добавить запись</button>
        <ThemeToggle />
      </div>
    </nav>
  );
}

function MobileControls({ onOpenCreate }) {
  return (
    <div className="mobile-bottom-group" role="navigation" aria-label="Mobile navigation">
      <Link to="/records" className="mbg-btn">📋 Список</Link>
      <button type="button" className="mbg-btn mbg-create" onClick={onOpenCreate}>➕ Создать запись</button>
      <Link to="/admin" className="mbg-btn">⚙️ Админ</Link>
    </div>
  );
}

function MobileThemeToggle() {
  return (
    <div className="mobile-theme-toggle">
      <ThemeToggle />
    </div>
  );
}

function App() {
  // helper: нормализовать статус платежа в каноничные значения
  const normalizeStatus = (s) => {
    const t = (s || '').toString().trim().toLowerCase();
    if (!t) return 'in-progress';
    const completed = ['paid','completed','done','проведена','проведен','оплачено'];
    const cancelled = ['cancelled','canceled','cancel','отмена','отменена','отменено'];
    const inprogress = ['unpaid','pending','in progress','in-progress','progress','в работе','ожидание','не оплачено'];
    if (completed.some(x => t.includes(x))) return 'completed';
    if (cancelled.some(x => t.includes(x))) return 'cancelled';
    if (inprogress.some(x => t.includes(x))) return 'in-progress';
    return 'in-progress';
  };

  // инициализация state синхронно из localStorage — это предотвратит перезапись при монтировании
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem('records');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((r, i) => ({
            id: r.id || `l-${Date.now()}-${i}`,
            ...r,
            payment_status: normalizeStatus(r.payment_status)
          }));
        }
      }
    } catch (err) {
      console.warn('localStorage parse error', err);
    }
    return [];
  });

  const [isMobile, setIsMobile] = useState(false);

  // детекция мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                           window.innerWidth <= 768 ||
                           ('ontouchstart' in window) ||
                           (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // загрузка remote JSON и дополнение state новыми записями (не перезаписываем локальные данные)
  useEffect(() => {
    let mounted = true;
    (async () => {
      let remote = [];
      try {
        remote = await getRecordCards();
      } catch (err) {
        console.warn('getRecordCards error', err);
      }

      // build set of local keys to avoid duplicates (client|car|service|date|price)
      const keyOf = (r) => `${(r.client||'').toString().trim().toLowerCase()}|${(r.car||'').toString().trim().toLowerCase()}|${(r.service||'').toString().trim().toLowerCase()}|${(r.date||'').toString().trim()}|${String(r.price||'').trim()}`;
      setRecords(prev => {
        const localKeys = new Set((prev||[]).map(keyOf));
        const remoteFiltered = (remote||[]).filter(r => !localKeys.has(keyOf(r)));

        // assign ids where missing and normalize status
        let idCounter = Date.now();
        const ensureId = (r, idx, prefix='r') => {
          const withId = r.id ? r : { ...r, id: `${prefix}-${idCounter + idx}` };
          return { ...withId, payment_status: normalizeStatus(withId.payment_status) };
        };

        const remoteWithId = (remoteFiltered||[]).map((r, i) => ensureId(r, i, 'r'));
        return [...prev, ...remoteWithId];
      });
    })();
    return () => { mounted = false };
  }, []);



  // сохраняем в localStorage при изменении state — используем сравнение чтобы меньше перезаписывать
  useEffect(() => {
    try {
      const raw = localStorage.getItem('records');
      const cur = JSON.stringify(records || []);
      if (raw !== cur) {
        localStorage.setItem('records', cur);
      }
    } catch (err) {
      console.warn('localStorage set error', err);
    }
  }, [records]);

  const addRecord = (rec) => {
    const newRec = {
      id: Date.now(),
      ...rec,
      price: rec.price ? Number(rec.price) : 0,
      payment_status: normalizeStatus(rec.payment_status || 'Pending')
    };
    setRecords(prev => [newRec, ...prev]);
  };
  // modal state for interactive actions (edit/delete/confirm)
  const [modal, setModal] = useState(null);

  const editRecord = useCallback((id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'edit', record: rec });
  }, [records]);

  const deleteRecord = useCallback((id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'delete', record: rec });
  }, [records]);

  const confirmRecord = useCallback((id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'confirm', record: rec });
  }, [records]);

  const closeModal = useCallback(() => setModal(null), []);

  const handleModalConfirm = useCallback((data) => {
    if (!modal) return;
    const { type, record } = modal;

    if (type === 'create') {
      // Resolve client data (similar to RecordForm logic)
      const clientName = (data.client || '').trim();
      let finalClientData = { id: clientName, name: clientName };
      
      if (clientName) {
        const { getUsers, findOrCreateClient } = require('./store/dataStore');
        const clients = getUsers().filter(u => u.role === 'client');
        const existingClient = clients.find(c => 
          c.name.toLowerCase() === clientName.toLowerCase()
        );
        
        if (!existingClient) {
          const newClient = findOrCreateClient(clientName);
          if (newClient) {
            finalClientData = { id: newClient.id, name: newClient.name };
          }
        } else {
          finalClientData = { id: existingClient.id, name: existingClient.name };
        }
      }

      const newRecord = {
        id: Date.now(),
        client: finalClientData.id,
        clientName: finalClientData.name,
        car: data.car,
        service: data.service,
        price: Number(data.price) || 0,
        date: data.date,
        master: data.master,
        payment_status: normalizeStatus(data.payment_status || 'Pending')
      };
      
      // Add car to history
      if (data.car && data.car.trim()) {
        const { addCarToHistory } = require('./store/dataStore');
        addCarToHistory(data.car.trim());
      }
      
      // Добавляем новую запись в начало списка
      setRecords(prev => [newRecord, ...prev]);
      closeModal();
    }

    if (type === 'edit') {
      const updated = {
        ...record,
        client: data.client, // Сохраняем ID или имя клиента
        clientName: data.client, // Для отображения имени
        car: data.car,
        service: data.service,
        price: Number(data.price) || 0,
        date: data.date,
        master: data.master,
        payment_status: normalizeStatus(data.payment_status)
      };
      
      // Добавляем автомобиль в историю только при успешном сохранении
      if (data.car && data.car.trim()) {
        addCarToHistory(data.car.trim());
      }
      
      setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
      closeModal();
    }

    if (type === 'delete') {
      const cancelledAt = new Date().toISOString();
      const updated = { ...record, payment_status: 'cancelled', cancel_reason: data.reason || '', cancelledAt };
      try {
        const raw = localStorage.getItem('deletedRecords');
        const parsed = raw ? JSON.parse(raw) : [];
        const log = Array.isArray(parsed) ? parsed : [];
        log.push({ id: record.id, deletedAt: cancelledAt, reason: data.reason || '', record: updated });
        localStorage.setItem('deletedRecords', JSON.stringify(log));
      } catch (err) {
        console.warn('failed to store deletedRecords', err);
      }
      setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
      closeModal();
    }

    if (type === 'confirm') {
      const updated = { ...record, payment_status: 'completed', payment_amount: Number(data.amount) || 0, payment_comment: data.comment || '' };
      setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
      closeModal();
    }
  }, [modal, closeModal]);



  // Callback функции для предотвращения бесконечных рендеров
  const handleModalFormChange = useCallback((fd) => {
    // Store form data in a ref to avoid triggering re-renders
    // Forms will pass data directly to handleModalConfirm
  }, []);

  // Вложенный компонент, чтобы использовать `useLocation` внутри Router
  function InnerApp() {
    const location = useLocation();
    const onRecordsRoute = location.pathname === '/' || location.pathname === '/records';

    const clearCache = () => {
      try {
        if (!window.confirm('Очистить локальный кэш приложения? Это удалит локальные записи и настройки.')) return;
        const keys = ['records','services','users','shifts','deletedRecords'];
        keys.forEach(k => localStorage.removeItem(k));
        // обновим видимые state
        setRecords([]);
        // небольшая перезагрузка интерфейса
        window.location.reload();
      } catch (err) {
        console.warn('clearCache error', err);
      }
    };

    return (
      <div className="app-container">
        <Navigation 
          onOpenCreate={() => setModal({ type: 'create' })} 
        />

        {isMobile && (
          <MobileControls
            onOpenCreate={() => setModal({ type: 'create' })}
          />
        )}
        {isMobile && <MobileThemeToggle />}
        {isMobile && <div className="mobile-bottom-gradient" />}

        <Routes>
          <Route path="/" element={
            <div className="records-area">
              <RecordList
                records={records}
                onEdit={editRecord}
                onDelete={deleteRecord}
                onConfirm={confirmRecord}
                users={getUsers()}
                services={getServices()}
              />
              {isMobile && onRecordsRoute && (
                <button className="cache-clear bottom-mobile" onClick={clearCache} title="Очистить кэш" aria-label="Очистить кэш">🗑️</button>
              )}
            </div>
          } />
          <Route path="/records" element={
            <div className="records-area">
              <RecordList
                records={records}
                onEdit={editRecord}
                onDelete={deleteRecord}
                onConfirm={confirmRecord}
                users={getUsers()}
                services={getServices()}
              />
              {isMobile && onRecordsRoute && (
                <button className="cache-clear bottom-mobile" onClick={clearCache} title="Очистить кэш" aria-label="Очистить кэш">🗑️</button>
              )}
            </div>
          } />
          <Route path="/services" element={<ServicesManagement />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/shifts" element={<ShiftsManagement />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* cache clear buttons: desktop bottom-right, mobile top-left when on records */}
        {onRecordsRoute && !isMobile && (
          <button className="cache-clear desktop" onClick={clearCache} title="Очистить кэш">🗑️ Очистить кэш</button>
        )}

        {modal && modal.type === 'edit' && (
          <Modal title="Редактировать запись" onCancel={closeModal} onConfirm={handleModalConfirm} confirmLabel="Сохранить">
            <EditForm initial={modal.record} onChange={handleModalFormChange} />
          </Modal>
        )}

        {modal && modal.type === 'delete' && (
          <Modal
            title="Причина удаления"
            onCancel={closeModal}
            onConfirm={handleModalConfirm}
            confirmLabel="Удалить"
          >
            <DeleteForm initial={modal.record} onChange={handleModalFormChange} />
          </Modal>
        )}

        {modal && modal.type === 'confirm' && (
          <Modal title="Подтверждение оплаты" onCancel={closeModal} onConfirm={handleModalConfirm} confirmLabel="Подтвердить">
            <ConfirmForm initial={modal.record} onChange={handleModalFormChange} />
          </Modal>
        )}

        {modal && modal.type === 'create' && (
          <Modal title="Создать запись" onCancel={closeModal} onConfirm={handleModalConfirm} confirmLabel="Создать">
            <RecordForm onChange={handleModalFormChange} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <InnerApp />
    </Router>
  );
}

export default App;
