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
    if (event.type === 'smart_app_data' && event.smart_app_data) {
      const { type, payload } = event.smart_app_data;
      console.log("Action received from assistant:", type);

      // Слушаем именно тот action, который ты указал в sendActionToApp в JAICP
      if (type === 'show_flights') {
          this.setState({
              loading: false,
              tripData: {
                  destination: payload.destination,
                  flights: (payload.flights || []).map(f => ({
                      airline: f.airline,
                      price: f.price,
                      departure: f.departure_at?.slice(11, 16),
                      arrival: f.return_at?.slice(11, 16) || '',
                      flightNumber: f.flight_number
                  })),
                  // Добавляем отели
                  hotels: (payload.hotels || []).map(h => ({
                      name: h.name || h.hotelName,
                      price: h.priceAvg || h.price,
                      stars: h.stars,
                      id: h.hotelId || h.id
                  }))
              },
              answer: `Нашёл билеты и отели в ${payload.destination}!`
          });
      }
    }
  }


  render() {
    const { tripData } = this.state;

    return (
      <div className="App">
        {/* <header className="App-header">
          <h1>Планировщик туров</h1>
        </header> */}

        <main className="content">
          {tripData && <TripPlanner tripData={tripData} />}
        </main>
      </div>
    );
  }
}