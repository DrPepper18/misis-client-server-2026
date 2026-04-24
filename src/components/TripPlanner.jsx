import React from 'react';
import './TripPlanner.css';

const TripPlanner = ({ tripData }) => {
  if (!tripData) {
    return <div className="tp-no-data">Нет данных о поездке</div>;
  }

  // Добавляем значения по умолчанию при деструктуризации, чтобы избежать undefined
  const { 
    destination = "Неизвестно", 
    duration = 0, 
    budget = 0, 
    flights = [], 
    hotels = [], 
    totalCost = 0 
  } = tripData;

  // Функция-помощник для безопасного форматирования чисел
  const formatPrice = (value) => (value || 0).toLocaleString();

  return (
    <div className="tp-root">
      <div className="tp-header">
        <h2>Путешествие в <span className="tp-dest">{destination}</span></h2>
        <div className="tp-info">
          <span>🗓️ {duration} дней</span>
          {/* Используем безопасное форматирование */}
          <span>💰 Бюджет: <b>{formatPrice(budget)} ₽</b></span>
        </div>
      </div>

      <div className="tp-section">
        <h3>✈️ Авиабилеты</h3>
        <div className="tp-cards">
          {flights.map((flight, idx) => (
            <div className="tp-card tp-flight" key={idx}>
              <div className="tp-card-title">{flight.airline} <span className="tp-flight-num">{flight.flightNumber || ''}</span></div>
              <div className="tp-card-row">🛫 {flight.departure || '—'} &rarr; 🛬 {flight.arrival || '—'}</div>
              <div className="tp-card-row tp-price">Цена: <b>{formatPrice(flight.price)} ₽</b></div>
            </div>
          ))}
        </div>
      </div>

      <div className="tp-section">
        <h3>🏨 Отели</h3>
        <div className="tp-cards">
          {hotels.map((hotel, idx) => (
            <div className="tp-card tp-hotel" key={idx}>
              <div className="tp-card-title">{hotel.name}</div>
              <div className="tp-card-row">⭐ {hotel.stars} звезды</div>
              {/* Исправляем названия полей (price vs pricePerNight) */}
              <div className="tp-card-row">Цена за ночь: <b>{formatPrice(hotel.pricePerNight || hotel.price)} ₽</b></div>
              <div className="tp-card-row">Всего: <b>{formatPrice(hotel.totalPrice || hotel.price)} ₽</b></div>
            </div>
          ))}
        </div>
      </div>

      <div className="tp-summary">
        <span>💸 Общая стоимость: <b>{formatPrice(totalCost || tripData.total)} ₽</b></span>
        {totalCost > budget ? (
          <span className="tp-over">Превышает бюджет!</span>
        ) : (
          <span className="tp-in">В рамках бюджета</span>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;