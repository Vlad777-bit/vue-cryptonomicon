const API_KEY =
  "64d0c3a75f4a30c616014ba6b4b01da6aa0a66d7765cf974a8a8aed7126c1760";
const AGGREGATE_INDEX = "5";
const INVALID_TYPE = "500";

const tickersHandlers = new Map();
export const notValidTickers = [];
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: ticker,
  } = JSON.parse(e.data);

  if (type === INVALID_TYPE) {
    const invalidTicker = ticker.split("~")[2];
    notValidTickers.push(invalidTicker);
  }
  
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true },
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
