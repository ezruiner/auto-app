import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RecordList from './components/RecordList';
import CreateCard from  './components/RecordForm';
import Modal from './components/Modal';
import EditForm from './components/EditForm';
import DeleteForm from './components/DeleteForm';
import ConfirmForm from './components/ConfirmForm';
import ThemeToggle from './components/ThemeToggle';
import AdminPanel from './components/AdminPanel';
import { getRecordCards } from './service/api';

function Navigation({ onOpenCreate, onToggleDisco, discoMode, showDiscoButton, isMobile }) {
  return (
    <nav>
      <div className="nav-left">
        <Link to="/records" className="btn">📋 Список записей</Link>
        <button className="btn" onClick={() => onOpenCreate()}>➕ Создать запись</button>
        <Link to="/admin" className="btn">⚙️ Администратор</Link>
      </div>
      <div className="nav-right">
        {showDiscoButton && <button className="btn" onClick={onToggleDisco}>{discoMode ? '🎉 Диско ВКЛ' : '🎈 Диско'}</button>}
        <ThemeToggle />
      </div>
    </nav>
  );
}

function MobileControls({ onToggleDisco, discoMode, showDiscoButton, onOpenCreate }) {
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

  const [discoMode, setDiscoMode] = useState(false);
  const [showDiscoButton, setShowDiscoButton] = useState(false);
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

  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let keySequence = [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      keySequence.push(e.keyCode);
      if (keySequence.length > konamiCode.length) {
        keySequence.shift();
      }
      if (keySequence.join(',') === konamiCode.join(',')) {
        setShowDiscoButton(prev => !prev);
        keySequence = [];
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  const editRecord = (id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'edit', record: rec });
  };

  const deleteRecord = (id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'delete', record: rec });
  };

  const confirmRecord = (id) => {
    const rec = records.find(r => String(r.id) === String(id));
    if (!rec) return;
    setModal({ type: 'confirm', record: rec });
  };

  const closeModal = () => setModal(null);

  const handleModalConfirm = (data) => {
    if (!modal) return;
    const { type, record } = modal;

    if (type === 'edit') {
      const updated = {
        ...record,
        client: data.client,
        car: data.car,
        service: data.service,
        price: Number(data.price) || 0,
        date: data.date,
        payment_status: normalizeStatus(data.payment_status)
      };
      setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
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
    }

    if (type === 'confirm') {
      const updated = { ...record, payment_status: 'completed', payment_amount: Number(data.amount) || 0, payment_comment: data.comment || '' };
      setRecords(prev => prev.map(r => (String(r.id) === String(record.id) ? updated : r)));
    }

    // Закрытие модала будет обработано через анимацию в Modal компоненте
  };

  // Эффект для применения disco класса к body
  useEffect(() => {
    if (discoMode) {
      document.body.classList.add('disco');
    } else {
      document.body.classList.remove('disco');
    }
  }, [discoMode]);

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
          onToggleDisco={() => setDiscoMode(!discoMode)} 
          discoMode={discoMode} 
          showDiscoButton={!isMobile && showDiscoButton} 
          isMobile={isMobile} 
        />

        {isMobile && (
          <MobileControls
            onToggleDisco={() => setDiscoMode(!discoMode)}
            discoMode={discoMode}
            showDiscoButton={showDiscoButton}
            onOpenCreate={() => setModal({ type: 'create' })}
          />
        )}
        {isMobile && <MobileThemeToggle />}

        <Routes>
          <Route path="/" element={
            <div className="records-area">
              <RecordList records={records} onEdit={editRecord} onDelete={deleteRecord} onConfirm={confirmRecord} />
              {isMobile && onRecordsRoute && (
                <button className="cache-clear bottom-mobile" onClick={clearCache} title="Очистить кэш" aria-label="Очистить кэш">🗑️</button>
              )}
            </div>
          } />
          <Route path="/records" element={
            <div className="records-area">
              <RecordList records={records} onEdit={editRecord} onDelete={deleteRecord} onConfirm={confirmRecord} />
              {isMobile && onRecordsRoute && (
                <button className="cache-clear bottom-mobile" onClick={clearCache} title="Очистить кэш" aria-label="Очистить кэш">🗑️</button>
              )}
            </div>
          } />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* cache clear buttons: desktop bottom-right, mobile top-left when on records */}
        {onRecordsRoute && !isMobile && (
          <button className="cache-clear desktop" onClick={clearCache} title="Очистить кэш">🗑️ Очистить кэш</button>
        )}

        {modal && modal.type === 'edit' && (
          <Modal title="Редактировать запись" onCancel={closeModal} onConfirm={() => handleModalConfirm(modal.formData)} confirmLabel="Сохранить">
            <EditForm initial={modal.record} onChange={(fd) => { modal.formData = fd; }} />
          </Modal>
        )}

        {modal && modal.type === 'delete' && (
          <Modal title="Причина удаления" onCancel={closeModal} onConfirm={() => handleModalConfirm(modal.formData)} confirmLabel="Удалить">
            <DeleteForm initial={modal.record} onChange={(fd) => { modal.formData = fd; }} />
          </Modal>
        )}

        {modal && modal.type === 'confirm' && (
          <Modal title="Подтверждение оплаты" onCancel={closeModal} onConfirm={() => handleModalConfirm(modal.formData)} confirmLabel="Подтвердить">
            <ConfirmForm initial={modal.record} onChange={(fd) => { modal.formData = fd; }} />
          </Modal>
        )}

        {modal && modal.type === 'create' && (
          <Modal title="Создать запись" onCancel={closeModal}>
            <CreateCard onAdd={(fd) => { addRecord(fd); closeModal(); }} onClose={closeModal} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <Router>
      <InnerApp />
    </Router>
  );
}

export default App;