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
      // getRecoveryState: getState,                                           
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
    console.log("TOKEN LENGTH:", process.env.REACT_APP_TOKEN?.length);
    super(props);
    this.state = { 
      answer: 'Куда вы хотите поехать?', 
      tripData: null,
      loading: false 
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    // Единый обработчик входящих данных
    this.assistant.on('data', (event) => {
      console.log('--- RAW EVENT RECEIVED ---', event); // Это покажет событие, даже если оно пустое
      this.handleAssistantAction(event);
    });
  }

  getStateForAssistant() {
    return { screen: 'main', hasTrip: !!this.state.tripData };
  }

  handleAssistantAction(event) {
    console.log("ПОЛУЧЕНО СОБЫТИЕ:", event);

    // 1. Проверка по стандарту README (самый надежный вариант)
    if (event.type === 'smart_app_data' && event.smart_app_data) {
        const { type, payload } = event.smart_app_data;
        console.log("Данные из smart_app_data:", payload);
        this.generateTrip(payload.destination);
    } 
    // 2. Резервная проверка (как в примере туду-листа)
    else if (event.action) {
        console.log("Данные из action:", event.action);
        // Если данные пришли в старом формате
        this.generateTrip(event.action.destination || event.action.note);
    }
  }

  generateTrip(destination) {
    this.setState({ loading: true });

    // База данных для моков
    const mockData = {
      'Сочи': {
        flights: [{ airline: 'Aeroflot', price: 12000, time: '10:00' }, { airline: 'S7', price: 9800, time: '15:30' }],
        hotels: [{ name: 'Radisson Blu Resort', stars: 5, price: 55000 }, { name: 'Sochi Park Hotel', stars: 3, price: 25000 }],
        total: 34800
      },
      'Питер': {
        flights: [{ airline: 'Rossiya', price: 7000, time: '08:00' }, { airline: 'Utair', price: 5500, time: '12:00' }],
        hotels: [{ name: 'Астория', stars: 5, price: 70000 }, { name: 'Отель Невский', stars: 4, price: 30000 }],
        total: 35500
      },
      'Казань': {
        flights: [{ airline: 'Nordwind', price: 6000, time: '11:00' }],
        hotels: [{ name: 'Kazan Palace', stars: 5, price: 40000 }, { name: 'Ibis Kazan', stars: 3, price: 15000 }],
        total: 21000
      }
    };

    // Ищем данные для города или берем дефолтные
    const cityData = mockData[destination] || {
      destination: destination,
      flights: [{ airline: 'Pobeda', price: 5000, time: '07:00' }],
      hotels: [{ name: 'Стандартный отель', stars: 3, price: 15000 }],
      total: 20000
    };

    const tripOptions = {
      destination: destination,
      ...cityData
    };

    // Имитируем задержку сети
    setTimeout(() => {
      this.setState({ 
        tripData: tripOptions, 
        loading: false,
        answer: `Готово! Нашел отличные варианты для поездки в ${destination}. Посмотрите на экран.`
      });
    }, 1200);
  };

  render() {
    const { answer, loading, tripData } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Планировщик туров</h1>
        </header>

        <main className="content">
          <div className="status-bar">
            {loading ? <p className="loader">Ищу лучшие предложения...</p> : <p>{answer}</p>}
          </div>

          {tripData && <TripPlanner tripData={tripData} />}
        </main>

        {/* Скрытый textarea для отладки или отображения лога */}
        <div className="debug-panel">
           <textarea value={answer} readOnly rows={4} />
        </div>
      </div>
    );
  }
}