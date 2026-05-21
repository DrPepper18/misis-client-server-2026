import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import './App.css';
import TripPlanner from './components/TripPlanner';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,                                                                                     
      nativePanel: {
        defaultText: 'Говорите!',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }
  return createAssistant({ getState });
};

export class App extends React.Component {
  constructor(props) {
    console.log("SMARTAPP NAME:", process.env.REACT_APP_SMARTAPP);
    super(props);

    // 1. При инициализации проверяем, нет ли сохраненных данных в кэше
    const savedTripData = localStorage.getItem('last_trip_payload');
    const isReturning = localStorage.getItem('returning_from_link');

    this.state = { 
      answer: savedTripData ? 'С возвращением!' : 'Куда вы хотите поехать?', 
      tripData: savedTripData ? JSON.parse(savedTripData) : null,
      loading: false 
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      console.log('--- RAW EVENT RECEIVED ---', event);
      this.handleAssistantAction(event);
    });

    // 2. Если вернулись по ссылке, шлем бэкенду скрытый экшен, чтобы он "знал" об этом
    if (isReturning === 'true') {
      localStorage.removeItem('returning_from_link'); // Одноразовый флаг, сразу чистим
      
      // Даем ассистенту время инициализироваться и отправляем событие
      setTimeout(() => {
        this.assistant.sendData({ action: { type: "USER_RETURNED" } });
      }, 500);
    }
  }

  getStateForAssistant() {
    // Теперь бэкенд честно будет знать, есть ли у нас данные, даже после перезагрузки
    return { screen: 'main', hasTrip: !!this.state.tripData };
  }

  handleAssistantAction(event) {
    if (event.type === 'smart_app_data' && event.smart_app_data) {
      const { type, payload } = event.smart_app_data;
      console.log("Action received from assistant:", type);

      if (type === 'show_flights') {
          const newTripData = {
              destination: payload.destination,
              flights: (payload.flights || []).map(f => ({
                  airline: f.airline,
                  price: f.price,
                  departure: f.departure_at?.slice(11, 16),
                  departureDate: f.departure_at?.slice(0, 10),
                  arrival: f.return_at?.slice(11, 16) || '',
                  flightNumber: f.flight_number,
                  link: f.link
              })),
              hotels: (payload.hotels || []).map(h => ({
                  name: h.name || h.hotelName,
                  price: h.priceAvg || h.price,
                  stars: h.stars,
                  id: h.hotelId || h.id,
                  link: h.link || `https://www.booking.com/hotel/${h.id}.html`
              }))
          };

          // Сохраняем свежие данные в localStorage на случай ухода по ссылке
          localStorage.setItem('last_trip_payload', JSON.stringify(newTripData));

          this.setState({
              loading: false,
              tripData: newTripData,
              answer: `Нашёл билеты и отели в ${payload.destination}!`
          });
      }
    }
  }

  render() {
    const { tripData } = this.state;
    return (
      <div className="App">
        <main className="content">
          {/* Передаем функцию сохранения флага в дочерний компонент */}
          <TripPlanner tripData={tripData || null} />
        </main>
      </div>
    );
  }
}