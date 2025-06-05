import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ko from "date-fns/locale/ko"; // 한국어
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import styles from './Home.module.css'
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";


function Home() {
  const DragAndDropCalendar = withDragAndDrop(Calendar);
  const locales = { "ko": ko };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
  const datefns = new Date();
  const [currentDate, setCurrentDate] = useState(datefns);
  const [selectedEvent, setSelectedEvent] = useState(null); // 조회용
  const [showModal, setShowModal] = useState(false); // 모달 on/off
  const [isNewEvent, setIsNewEvent] = useState(false); // 등록인지 조회인지 판단
  const [isEditing, setIsEditing] = useState(false); // 수정 모드인지
  const [showValidationError, setShowValidationError] = useState(false); //필수 입력값 오류 메시지 출력
  const [originalEventForm, setOriginalEventForm] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    country: '',
    description: '',
    start: null,
    end: null
  });

  const isInvalidTitle = eventForm.title.trim() === '';
  const isInvalidDateRange =
  eventForm.start && eventForm.end && new Date(eventForm.start) > new Date(eventForm.end);

  const isFormInvalid = isInvalidDateRange || isInvalidTitle;
  
  // ✅ 드래그/리사이즈를 위해 state로 관리
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "여행 일정",
      start: new Date(2025, 5, 10, 10, 0),
      end: new Date(2025, 5, 18, 12, 0),
      country : "Taiwan",
      description: " ",
      color: getRandomColor(),
    },
  ]);

  const calendarStyle = {
    height: "620px",
    width: "70%",
    margin: "30px auto",
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventForm(event); // 내용 채우기
    setIsNewEvent(false);
    setShowModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    setIsNewEvent(true);
    setEventForm({
      title: '',
      country: '',
      description: '',
      start,
      end
    });
    setShowModal(true);
};

  // ✅ 이벤트 드래그 시 호출
  const moveEvent = ({ event, start, end }) => {
    const updatedEvents = events.map((evt) =>
      evt.id === event.id ? { ...evt, start, end } : evt
    );
    setEvents(updatedEvents);
  };

  // ✅ 이벤트 리사이즈 시 호출
  const resizeEvent = ({ event, start, end }) => {
    const updatedEvents = events.map((evt) =>
      evt.id === event.id ? { ...evt, start, end } : evt
    );
    setEvents(updatedEvents);
  };

  function formatInputDate(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  }

  const CustomToolbar = ({ label, onNavigate }) => {
    const formattingLabel = label.split(" ").reverse().join(" ");
    return (
      <div
        className={styles.toolbar}
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          padding: "10px",
          paddingBottom: "30px",
        }}
      >
        <button onClick={() => onNavigate("PREV")}>
          <i className="fas fa-angle-left"></i>
        </button>

        <span>{formattingLabel}</span>

        <button onClick={() => onNavigate("NEXT")}>
          <i className="fas fa-angle-right"></i>
        </button>
      </div>
    );
  };

  function getRandomColor() {
    const r = Math.floor(Math.random() * 30 + 180);  // 180~210 → 낮은 채도의 R
    const g = Math.floor(Math.random() * 50 + 200);  // 200~250 → 맑은 G
    const b = Math.floor(Math.random() * 30 + 220);  // 220~250 → 밝은 B
    return `rgb(${r}, ${g}, ${b})`;
  }


  return (
    <div style={calendarStyle}>
      <DragAndDropCalendar
        localizer={localizer} 
        defaultView="month" /* 기본 뷰 */
        date={currentDate} /* 관리할 날짜 */
        events={events} /* event list */
        onNavigate={(date) => setCurrentDate(date)}
        views={{ month: true }}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent} /* event click */
        onSelectSlot={handleSelectSlot}
        onEventDrop = {moveEvent}
        onEventResize = {resizeEvent}
        resizable
        selectable
        components={{ toolbar: CustomToolbar }}
        eventPropGetter={(event) => {
          return {
            style: {
              backgroundColor: event.color,
              color: "black",
              borderRadius: "5px",
              padding: "3px",
              border: "none",
              fontSize:"12px"
            },
          };
        }}
      />

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 style={{marginBottom:"10px"}}>
            {isNewEvent ? "새 일정 등록" : isEditing ? "일정 수정" : "일정 상세 보기"}
            </h3>

            <label>제목</label>
            <input
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              disabled={!isNewEvent && !isEditing}
            />
            {showValidationError && isInvalidTitle && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                제목은 필수입니다.
              </p>
            )}

            <label>여행 기간</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="datetime-local"
                value={eventForm.start ? formatInputDate(eventForm.start) : ''}
                onChange={(e) =>
                  setEventForm({ ...eventForm, start: new Date(e.target.value) })
                }
                disabled={!isNewEvent && !isEditing}
              />
              <span>~</span>
              <input
                type="datetime-local"
                value={eventForm.end ? formatInputDate(eventForm.end) : ''}
                onChange={(e) =>
                  setEventForm({ ...eventForm, end: new Date(e.target.value) })
                }
                disabled={!isNewEvent && !isEditing}
              />
            </div>

            {isInvalidDateRange && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                출발일은 도착일보다 앞서야 합니다.
              </p>
            )}


            <label>국가</label>
            <input
              value={eventForm.country}
              onChange={(e) => setEventForm({ ...eventForm, country: e.target.value })}
              disabled={!isNewEvent && !isEditing}
            />

            <label>내용</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              disabled={!isNewEvent && !isEditing}
            />

            <div className={styles.modalButtons}>
              {isNewEvent ? (
                <button onClick={() => {
                  setShowValidationError(true);
                  if (isFormInvalid) return;

                  const newEvent = {
                    ...eventForm,
                    id: events.length + 1,
                    start: new Date(eventForm.start),
                    end: new Date(eventForm.end),
                    color: getRandomColor()
                  };
                  setEvents([...events, newEvent]);
                  setShowModal(false);
                  setShowValidationError(false);
                }}
                >
                  등록
                </button>
              ) : isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setShowValidationError(true);
                      if (isFormInvalid) return;

                      const updatedEvents = events.map(e =>
                        e.id === selectedEvent.id ? { ...eventForm } : e
                      );
                      setEvents(updatedEvents);
                      setIsEditing(false);
                      setShowModal(false);
                      setShowValidationError(false);
                    }}
                  >
                    저장
                  </button>
                  <button onClick={() => {
                    setEventForm(originalEventForm);  // 원본 복원
                    setIsEditing(false);
                  }}>
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => {
                    setOriginalEventForm(eventForm);  // 수정 전 상태 저장
                    setIsEditing(true);
                  }}>
                    수정
                  </button>
                  <button onClick={() => {
                    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
                    if (confirmDelete) {
                      setEvents(events.filter(e => e.id !== selectedEvent.id));
                      setShowModal(false);
                    }
                  }}>
                    삭제
                  </button>
                </>
              )}

              <button onClick={() => {
                setShowModal(false);
                setIsEditing(false);
                setOriginalEventForm(null);
              }}>
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Home;