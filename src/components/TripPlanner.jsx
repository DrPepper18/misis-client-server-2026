import React from 'react';
import './TripPlanner.css';

const TripPlanner = ({ tripData }) => {
    if (!tripData) return null;

    const { destination, flights, hotels } = tripData;
    console.log("Rendering TripPlanner with data:", tripData);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatTime = (time) => {
        if (!time) return '--:--';
        if (time.length > 10) return time.slice(11, 16);
        return time;
    };

    return (
        <div className="trip-planner">
            <h2 className="trip-title">Ваше путешествие в {destination}</h2>
            
            <div className="panels-container">
                {/* Левая панель: Полеты */}
                <div className="panel-column" style={{ overflow: 'scroll'}}>
                    <h3 className="column-subtitle">✈️ Перелеты</h3>
                    <div className="cards-stack">
                        {flights && flights.length > 0 ? (
                            flights.map((flight, index) => (
                                <div key={index} className="flight-card">
                                    <div className="flight-header">
                                        <img 
                                            src={`https://pics.avs.io/al_base/100/40/${flight.airline}.png`} 
                                            alt={flight.airline}
                                            className="airline-logo"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                        <span className="flight-number">{flight.flight_number || 'Рейс'}</span>
                                    </div>
                                    <div className="flight-info">
                                        <div className="time-block">
                                            <span className="label">{"Вылет "}</span>
                                            <span className="time">{formatTime(flight.departure)}</span>
                                        </div>
                                        <div className="time-block">
                                            <span className="label">{"Прибытие "}</span>
                                            <span className="time">{formatTime(flight.arrival)}</span>
                                        </div>
                                        <div className="price-block">
                                            <span className="label">{"Цена "}</span>
                                            <span className="price">{formatPrice(flight.price)}</span>
                                        </div>
                                    </div>
                                    <button className="book-button" onClick={() => window.open(`https://www.aviasales.ru${flight.link}`, '_blank')}>
                                        Выбрать рейс
                                    </button>
                                </div>
                            ))
                        ) : <div className="no-flights">Рейсов не найдено</div>}
                    </div>
                </div>

                {/* Правая панель: Отели */}
                <div className="panel-column">
                    <h3 className="column-subtitle">🏨 Проживание</h3>
                    <div className="cards-stack">
                        {hotels && hotels.length > 0 ? (
                            hotels.map((hotel, index) => (
                                <div key={index} className="flight-card hotel-card">
                                    <div className="hotel-image-container">
                                        <img 
                                            src={`https://photo.hotellook.com/image_v2/limit/h${hotel.id}_0/400/240.jpg`} 
                                            alt={hotel.name}
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x240?text=Hotel'}
                                        />
                                    </div>
                                    <div className="flight-header">
                                        <span className="hotel-name">{hotel.name}</span>
                                        <span className="stars">{'★'.repeat(hotel.stars)}</span>
                                    </div>
                                    <div className="flight-info">
                                        <div className="time-block">
                                            <span className="label">{"Рейтинг "}</span>
                                            <span className="time">{hotel.stars}.0</span>
                                        </div>
                                        <div className="price-block">
                                            <span className="label">{"За ночь "}</span>
                                            <span className="price">{formatPrice(hotel.price)}</span>
                                        </div>
                                    </div>
                                    <button className="book-button secondary">Забронировать</button>
                                </div>
                            ))
                        ) : <div className="no-flights">Отелей не найдено</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripPlanner;