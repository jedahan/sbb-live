import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import lines from "./log.js";

const heros = ["Merlin", "Sharebear", "Mordred", "Apocalypse"] as const;
type Hero = typeof heros[number];

const HeroIDs: Record<string, Hero> = {
  '5e525924-1173-46c8-89c6-4729777818df': "Merlin",
}

const records: Game[] = lines
  .map(({Hero: { Card: { ID } }, Placement }) => ({
     hero: HeroIDs[ID] ?? 'Unknown',
     placement: Placement,
     mmr: Math.round(-100 + (25 * (8-Placement)) - 10 + (Math.random() * 20))
    })
  )

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

type Placement = number;
const isPlacement = (placement: number): placement is Placement => placement > 0 && placement <= 8;

type Mmr = number;

interface Game {
  hero: Hero;
  placement: Placement;
  mmr: Mmr;
}

function Record({ hero, placement, mmr }: Game, index: number) {
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
      key={index}
    >
      <span
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
        {placement === "1" ? "👑" : placement}
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
