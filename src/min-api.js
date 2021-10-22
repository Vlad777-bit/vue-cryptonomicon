export const getCoinData = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true",
  )
    .then((r) => r.json())
    .then((rawData) => {
      const sourceData = Object.entries(rawData.Data);
      const coinsArray = sourceData.map(([key, value]) => ({
        id: value.Id,
        symbol: key,
        fullName: value.FullName,
      }));

      return coinsArray;
    })
    .catch((err) => {
      throw new Error(`Ошибка при плучении данных: ${err}`);
    });
};