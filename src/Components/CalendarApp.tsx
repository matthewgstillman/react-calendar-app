import React from 'react';
import { useState } from 'react';

type EventTime = {
  hours: string;
  minutes: string;
}

type Event = {
  id: number;
  date: Date;
  time: string;
  text: string;
};

const CalendarApp: React.FC = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentDate = new Date();

  const [currentMonth, setCurrentMonth] = useState<number>(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [showEventPopup, setShowEventPopup] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTime, setEventTime] = useState<EventTime>({hours: "00", minutes: "00"});
  const [eventText, setEventText] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear));
  }

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) => (currentMonth === 11 ? prevYear + 1 : prevYear));
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    if(clickedDate >= today || isSameDay(clickedDate, today)) {
      setSelectedDate(clickedDate);
      setShowEventPopup(true);
      setEventTime({hours: "00", minutes: "00"});
      setEventText("");
      setEditingEvent(null);
    }
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() && 
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const handleEventSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newEvent: Event = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: `${eventTime.hours.padStart(2, '0')}:${eventTime.minutes.padStart(2, '0')}`,
      text: eventText,
    }

    let updatedEvents = [...events];

    if(editingEvent) {
      updatedEvents = updatedEvents.map((event) => event.id === editingEvent.id ? newEvent : event);
    } else {
      updatedEvents.push(newEvent);
    }

    updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setEvents(updatedEvents);
    setEventTime({ hours: "00", minutes: "00" });
    setEventText("");
    setShowEventPopup(false);
    setEditingEvent(null);
  }

  const handleEditEvent = (event: Event) => {
    setSelectedDate(new Date(event.date));
    setEventTime({
      hours: event.time.split(":")[0],
      minutes: event.time.split(":")[1],
    });
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  }

  const convertTo12HourFormat = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleDeleteEvent = (eventId: number) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEventTime((prevTime) => ({ ...prevTime, [name]: value.padStart(2, '0') }));
  }

  return (
    <div className="calendar-app">
      <div className="calendar">
        <h1 className="heading">Calendar</h1>
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]}</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <i className="bx bx-chevron-left" onClick={prevMonth}></i>
            <i className="bx bx-chevron-right" onClick={nextMonth}></i>
          </div>
        </div>
        <div className="weekdays">
          {daysOfWeek.map((day) => 
            <span key={day}>{day}</span>
          )}
        </div>
        <div className="days">
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <span key={`empty-${index}`}/>
          ))}
          {[...Array(daysInMonth).keys()].map((day) => (
            <span key={day + 1} className={day + 1 === currentDate.getDate() && currentMonth === currentDate.getMonth() && 
              currentYear == currentDate.getFullYear() ? 'current-day' : ''} 
              onClick={() => handleDayClick(day + 1)}
              >{day + 1}</span>
          ))}
        </div>
      </div>
      <div className="events">
        {showEventPopup && (
          <div className="event-popup">
            <div className="time-input">
              <div className="event-popup-time">Time</div>
              <input type="number" name="hours" min={0} max={24} className="hours" value={eventTime.hours} onChange={handleTimeChange}/>
              <input type="number" name="minutes" min={0} max={60} className="minutes" value={eventTime.minutes} onChange={handleTimeChange}/>
            </div>
            <textarea placeholder="Enter Event Text (Maximum 60 Characters)" value={eventText} onChange={(e) => {
              if(e.target.value.length <= 60) {
                setEventText(e.target.value);
              }
            }}></textarea>
            <button className="event-popup-btn" onClick={handleEventSubmit}>
              {editingEvent ? "Update Event" : "Add Event"}
            </button>
            <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
        {events.map((event, index) => (
        <div className="event" key={index}>
          <div className="event-date-wrapper">
          <div className="event-date">
             {`${monthsOfYear[event.date.getMonth()].length === 3 ? monthsOfYear[event.date.getMonth()] : monthsOfYear[event.date.getMonth()].substring(0, 3)} ${event.date.getDate()}, ${event.date.getFullYear()}`}
          </div>
            <div className="event-time">{convertTo12HourFormat(event.time)}</div>
          </div>
          <div className="event-text">{event.text}</div>
          <div className="event-buttons">
            <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
            <i className="bx bxs-message-alt-x" onClick={() => handleDeleteEvent(event.id)}></i>
          </div>
        </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarApp