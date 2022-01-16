import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Storybook Brawl recent matches</p>
        <div style={{ flexDirection: "column" }}>{records.map(Record)}</div>
      </header>
    </div>
  );
}

type Place = number;
const isPlace = (place: number): place is Place => place > 0 && place <= 8;

type Hero = "Merlin" | "Sharebear" | "Mordred" | "Trophy Hunter" | "Apocalypse";

type Mmr = number;
const isMmmr = (mmr: number): mmr is Mmr => mmr > 0;

interface Game {
  hero: Hero;
  place: Place;
  mmr: Mmr;
}
const Record = ({ hero, place, mmr }: Game) => {
  return (
    <div className="record" style={{ flexDirection: "row" }}>
      <div>
        <img src={`images/heros/${hero}.png`} alt={hero} />
        <span className="place" style={{ position: "absolute" }}>
          {place}
        </span>
      </div>
      <div>
        <span className="mmr">{mmr}</span>
      </div>
    </div>
  );
};

const records: Game[] = [
  { hero: "Merlin", place: 7, mmr: 3333 },
  { hero: "Apocalypse", place: 1, mmr: 3500 },
];
