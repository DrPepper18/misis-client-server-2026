// src/api/travelpayouts.js
// Модуль для работы с TravelPayouts API (авиабилеты)

const API_URL = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const API_TOKEN = process.env.REACT_APP_TRAVELPAYOUTS_TOKEN;

/**
 * Поиск авиабилетов через TravelPayouts
 * @param {string} origin - IATA код города отправления
 * @param {string} destination - IATA код города назначения
 * @param {string} depart_date - Дата вылета (YYYY-MM-DD)
 * @returns {Promise<Object>} Результаты поиска
 */
export async function searchFlights({ origin, destination, depart_date }) {
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date,
    token: API_TOKEN,
    one_way: 'true',
    currency: 'rub',
    limit: '10',
  });

  const url = `${API_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка запроса к TravelPayouts');
  return response.json();
}
