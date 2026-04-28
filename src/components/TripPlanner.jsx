import React from 'react';
import './TripPlanner.css';

const TripPlanner = ({ tripData }) => {
    console.log("TripPlanner received tripData:", tripData);
    if (!tripData) return null;

    const { destination, flights } = tripData;

    // Функция для красивого форматирования цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Функция для форматирования времени
    const formatTime = (time) => {
        if (!time) return '--:--';
        if (typeof time === 'string' && time.includes(':')) return time;
        return '--:--';
    };

    return (
        <div className="trip-planner">
            <h2 className="trip-title">✈️ Полеты в {destination}</h2>
            
            <div className="flights-container">
                {flights && flights.length > 0 ? (
                    flights.map((flight, index) => (
                        <div key={index} className="flight-card">
                            <div className="flight-header">
                                {/* Логотип авиакомпании от Aviasales CDN */}
                                <img 
                                    src={`https://pics.avs.io/al_base/100/40/${flight.airline}.png`} 
                                    alt={`Логотип авиакомпании ${flight.airline}`}
                                    className="airline-logo" 
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span className="flight-number">{flight.flightNumber || 'Рейс'}</span>
                            </div>

                            <div className="flight-info">
                                <div className="time-block">
                                    <span className="label">Вылет</span>
                                    <span className="time">{formatTime(flight.departure)}</span>
                                </div>
                                
                                <div className="price-block">
                                    <span className="label">Цена</span>
                                    <span className="price">{formatPrice(flight.price)}</span>
                                </div>
                            </div>

                            <button 
                                className="book-button" 
                                onClick={() => {
                                    window.open(`https://www.aviasales.ru${flight.link}`, '_blank');
                                }}
                            >
                                Выбрать рейс
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-flights">
                        😔 К сожалению, прямых рейсов в {destination} не найдено.
                        <br />
                        <span style={{ fontSize: '0.9em', marginTop: '12px', display: 'block' }}>
                            Попробуйте изменить даты или пункт назначения
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default TripPlanner;