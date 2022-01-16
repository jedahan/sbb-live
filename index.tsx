import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const records: Game[] = [
  { hero: "Merlin", place: 7, mmr: 3333 },
  { hero: "Apocalypse", place: 1, mmr: 3500 },
];

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

const heros = ["Merlin", "Sharebear", "Mordred", "Apocalypse"] as const;
type Hero = typeof heros[number];

type Mmr = number;
const isMmmr = (mmr: number): mmr is Mmr => mmr > 0;

interface Game {
  hero: Hero;
  place: Place;
  mmr: Mmr;
}
function Record({ hero, place, mmr }: Game) {
  const heroUri = `asssets/cards/SBB_HERO_${hero.toUpperCase()}.png`;
  return (
    <div
      className="record"
      style={{ flexDirection: "row" }}
      key={[hero, place, mmr].join(".")}
    >
      <div>
        <img src={heroUri} alt={hero} />
        <span className="place" style={{ position: "absolute" }}>
          {place}
        </span>
      </div>
      <div>
        <span className="mmr">{mmr}</span>
      </div>
    </div>
  );
}
