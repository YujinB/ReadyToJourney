import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ko from "date-fns/locale/ko";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import styles from './Financial.module.css';
import CurrencyModal from './CurrencyModal.js';

function Financial() {
  const locales = { ko };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);

  const [eventForm, setEventForm] = useState({
    title: '',
    country: '',
    description: '',
    start: null,
    end: null,
    expenseDate: null,
    expenseAmount: '',
    expenseCategory: '',
    expenseCurrency: 'USD',
    expenseForeignAmount: '',
  });

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "여행 일정",
      start: new Date(2025, 5, 10, 10, 0),
      end: new Date(2025, 5, 18, 12, 0),
      country: "Taiwan",
      description: " ",
      color: getRandomColor(),
      expenses: []
    },
  ]);

  const generateDailyExpenseEvents = () => {
    const expenseMap = new Map();
    events.forEach((event) => {
      (event.expenses || []).forEach((exp) => {
        const dateKey = format(new Date(exp.date), "yyyy-MM-dd");
        const current = expenseMap.get(dateKey) || 0;
        expenseMap.set(dateKey, current + exp.amount);
      });
    });

    const result = [];
    for (const [dateStr, totalAmount] of expenseMap.entries()) {
      const date = new Date(dateStr);
      result.push({
        id: `expense-${dateStr}`,
        title: `💸 ${totalAmount.toLocaleString()}원`,
        start: new Date(date.setHours(12, 0, 0)),
        end: new Date(date.setHours(13, 0, 0)),
        allDay: false,
        isExpense: true,
      });
    }
    return result;
  };

  const allEvents = [...events, ...generateDailyExpenseEvents()];

  const calendarStyle = {
    height: "620px",
    width: "70%",
    margin: "30px auto",
  };

  const handleSelectSlot = ({ start }) => {
    const relatedEvent = events.find((event) => {
      const s = new Date(event.start).setHours(0, 0, 0, 0);
      const e = new Date(event.end).setHours(0, 0, 0, 0);
      const sel = new Date(start).setHours(0, 0, 0, 0);
      return sel >= s && sel <= e;
    });

    if (!relatedEvent) {
      alert("해당 날짜에는 이벤트가 없어 지출을 등록할 수 없습니다.");
      return;
    }

    setSelectedEvent(relatedEvent);
    setEventForm({
      ...relatedEvent,
      expenseDate: start,
      expenseAmount: '',
      expenseCategory: ''
    });
    setIsEditingExpense(false);
    setShowModal(true);
  };

  const handleExpenseSubmit = () => {
    const {
      expenseDate,
      expenseAmount,
      expenseCategory,
      expenseForeignAmount,
      expenseCurrency
    } = eventForm;

    if (!expenseAmount || isNaN(expenseAmount)) {
      alert("금액을 올바르게 입력해주세요.");
      return;
    }

    const updatedEvents = events.map((event) => {
      if (event.id === selectedEvent.id) {
        const updatedExpenses = [...(event.expenses || [])];

        if (isEditingExpense && editingIndex !== null) {
          updatedExpenses[editingIndex] = {
            date: expenseDate,
            amount: parseFloat(expenseAmount),
            foreignAmount: parseFloat(expenseForeignAmount),
            currency: expenseCurrency,
            category: expenseCategory || '기타',
          };
        } else {
          updatedExpenses.push({
            date: expenseDate,
            amount: parseFloat(expenseAmount),
            foreignAmount: parseFloat(expenseForeignAmount),
            currency: expenseCurrency,
            category: expenseCategory || '기타',
          });
        }

        return { ...event, expenses: updatedExpenses };
      }
      return event;
    });

    setEvents(updatedEvents);

    const updatedSelected = updatedEvents.find(e => e.id === selectedEvent.id);
    setSelectedEvent(updatedSelected);
    setEventForm((prev) => ({
      ...prev,
      expenses: updatedSelected.expenses,
      expenseAmount: '',
      expenseForeignAmount: '',
      expenseCurrency: 'USD',
      expenseCategory: '',
    }));

    setIsEditingExpense(false);
    setEditingIndex(null);
  };

  const getExpensesByDate = (event, date) => {
    const targetDate = new Date(date).setHours(0, 0, 0, 0);
    return (event.expenses || []).filter((exp) => {
      const expDate = new Date(exp.date).setHours(0, 0, 0, 0);
      return expDate === targetDate;
    });
  };

  const handleEditExpense = (index) => {
    const expense = getExpensesByDate(selectedEvent, eventForm.expenseDate)[index];
    setEventForm((prev) => ({
      ...prev,
      expenseAmount: expense.amount,
      expenseCategory: expense.category
    }));
    setEditingIndex(index);
    setIsEditingExpense(true);
  };

  const handleDeleteExpense = (idxToDelete) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? {
            ...event,
            expenses: event.expenses.filter((_, idx) => idx !== idxToDelete),
          }
        : event
    );
    setEvents(updatedEvents);
    const updatedSelected = updatedEvents.find(e => e.id === selectedEvent.id);
    setSelectedEvent(updatedSelected);
    setEventForm((prev) => ({
      ...prev,
      expenses: updatedSelected.expenses,
    }));
  };

  const CustomToolbar = ({ label, onNavigate }) => {
    const formattingLabel = label.split(" ").reverse().join(" ");
    return (
      <div className={styles.toolbar} style={{ display: "flex", justifyContent: "center", padding: "10px", paddingBottom: "30px" }}>
        <button onClick={() => onNavigate("PREV")}><i className="fas fa-angle-left"></i></button>
        <span>{formattingLabel}</span>
        <button onClick={() => onNavigate("NEXT")}><i className="fas fa-angle-right"></i></button>
      </div>
    );
  };

  function getRandomColor() {
    const r = Math.floor(Math.random() * 30 + 180);
    const g = Math.floor(Math.random() * 50 + 200);
    const b = Math.floor(Math.random() * 30 + 220);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <div style={calendarStyle}>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", fontSize: "24px" }}>
        <i className="fas fa-globe" onClick={() => setShowCurrencyModal(true)} style={{ cursor: 'pointer' }}></i>
      </div>
      <Calendar
        localizer={localizer}
        defaultView="month"
        date={currentDate}
        events={allEvents}
        onNavigate={(date) => setCurrentDate(date)}
        views={{ month: true }}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        selectable
        components={{ toolbar: CustomToolbar }}
        eventPropGetter={(event) => {
          if (event.isExpense) {
            return {
              style: {
                backgroundColor: "transparent",
                color: "#d32f2f",
                fontSize: "11px",
                textAlign: "right",
                paddingRight: "2px"
              }
            };
          } else {
            return {
              style: {
                backgroundColor: event.color,
                color: "black",
                borderRadius: "5px",
                padding: "3px",
                fontSize: "12px"
              }
            };
          }
        }}
      />

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 style={{marginBottom:"20px"}}>{format(eventForm.expenseDate, "yyyy-MM-dd")} 지출 {isEditingExpense ? "수정" : "등록"}</h3>
            
            <div style={{display:"flex", gap:"5px", margin:"10px"}}>
              <p>외화 선택 : </p>
              <select
                value={eventForm.expenseCurrency}
                onChange={async (e) => {
                  const newCurrency = e.target.value;
                  const foreignAmount = parseFloat(eventForm.expenseForeignAmount || 0);
                  try {
                    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${newCurrency}`);
                    const data = await res.json();
                    const rate = data.rates["KRW"] || 1;
                    setExchangeRate(rate);
                    setEventForm((prev) => ({
                      ...prev,
                      expenseCurrency: newCurrency,
                      expenseAmount: (foreignAmount * rate).toFixed(0)
                    }));
                  } catch (err) {
                    alert("환율 정보를 불러오지 못했습니다.");
                    console.error(err);
                  }
                }}
              >
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
                <option value="EUR">EUR</option>
                <option value="KRW">KRW</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 10px", fontSize:"14px"}}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <input
                  type="number"
                  placeholder={eventForm.expenseCurrency ? eventForm.expenseCurrency : "외화 금액"}
                  value={eventForm.expenseForeignAmount || ''}
                  onChange={(e) => {
                    const foreignValue = parseFloat(e.target.value) || 0;
                    setEventForm((prev) => ({
                      ...prev,
                      expenseForeignAmount: foreignValue,
                      expenseAmount: (foreignValue * exchangeRate).toFixed(0)
                    }));
                  }}
                />
              </div>
              {eventForm.expenseCurrency || 'USD'}

              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <input
                  type="number"
                  placeholder="환산 금액"
                  value={eventForm.expenseAmount}
                  readOnly
                />
              </div>
              KRW
            </div>
            <div style={{margin:"0 10px"}}>
              <input
                type="text"
                placeholder="항목 (예: 식비, 교통비)"
                value={eventForm.expenseCategory}
                onChange={(e) => setEventForm({ ...eventForm, expenseCategory: e.target.value })}
              />
            </div>
            <div style={{display:"flex", justifyContent:"flex-end"}}>
              <button style={{margin:"10px"}} onClick={handleExpenseSubmit}>{isEditingExpense ? "수정 완료" : "등록"}</button>
            </div>

            <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.3)" }}></div>

            {selectedEvent && (
              <div style={{ marginTop: '20px', margin: "20px" }}>
                <h4 style={{marginBottom:"10px"}}>💰 지출 내역</h4>
                {getExpensesByDate(selectedEvent, eventForm.expenseDate).length > 0 ? (
                  <ul>
                    {getExpensesByDate(selectedEvent, eventForm.expenseDate).map((exp, idx) => (
                      <li key={idx} style={{ fontSize: '14px', marginBottom: '6px' }}>
                        {exp.amount.toLocaleString()}원 ({exp.category})
                        <button onClick={() => handleEditExpense(idx)} style={{ marginLeft: 10 }}>수정</button>
                        <button onClick={() => handleDeleteExpense(idx)} style={{ marginLeft: 5, color: 'red' }}>삭제</button>
                      </li>
                    ))}

                    <div style={{ marginTop: '15px', width: "100%", height: "0.5px", backgroundColor: "rgba(0,0,0,0.2)" }}></div>

                    <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '15px' }}>
                        총 지출 합계: {
                        getExpensesByDate(selectedEvent, eventForm.expenseDate)
                        .reduce((sum, exp) => sum + (exp.amount || 0), 0)
                        .toLocaleString()}원
                    </div>
                  </ul>
                ) : (
                  <p style={{ fontSize: '14px' }}>등록된 지출이 없습니다.</p>
                )}
              </div>
            )}
            <div style={{display:"flex", justifyContent:"flex-end", marginRight:"10px"}}>
              <button onClick={() => setShowModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {showCurrencyModal && (
        <CurrencyModal
          onClose={() => setShowCurrencyModal(false)}
          onApply={(value) => {
            setEventForm((prev) => ({
              ...prev,
              expenseAmount: value
            }));
            setShowCurrencyModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Financial;
