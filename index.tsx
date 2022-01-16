import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const records: Game[] = [
  { hero: "Merlin", place: 7, mmr: -111 },
  { hero: "Apocalypse", place: 1, mmr: +42 },
];

const starting = 5396;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

function App() {
  const current = records.reduce((sum, { mmr }) => mmr + sum, starting);
  return (
    <div className="App">
      <header className="App-header">
        <h2>mmr</h2>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <span>
            <h4>starting</h4>
            <div>{starting}</div>
          </span>
          <span>
            <h4>current</h4>
            <div>{current}</div>
          </span>
        </div>

        <h2>scores</h2>
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

interface Game {
  hero: Hero;
  place: Place;
  mmr: Mmr;
}

function Record({ hero, place, mmr }: Game) {
  const heroUri = `/assets/cards/SBB_HERO_${hero.toUpperCase()}.png`;
  const fontSize = 80;
  const textShadow = "6px 6px 2px black";

  return (
    <div
      className="record"
      style={{
        flexDirection: "row",
        display: "flex",
        alignItems: "end",
      }}
      key={[hero, place, mmr].join(".")}
    >
      <span
        className="place"
        style={{
          fontSize,
          textShadow: "6px 6px 2px black",
          width: "161px",
          height: "204px",
          display: "block",
          backgroundImage: `url(${heroUri})`,
          fontWeight: "bold",
        }}
      >
        {place === 1 ? "👑" : place}
      </span>

      <span
        className="mmr"
        style={{
          fontSize,
          textShadow,
          textAlign: "end",
          flexGrow: 1,
        }}
      >
        {mmr > 0 ? `+${mmr}` : mmr}
      </span>
    </div>
  );
}
