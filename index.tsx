import React, { useState, FocusEventHandler } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import lines from './log.js'

const heros = ['Merlin', 'Sharebear', 'Mordred', 'Apocalypse'] as const
type Hero = typeof heros[number]

const HeroIDs: Record<string, Hero> = {
  '5e525924-1173-46c8-89c6-4729777818df': 'Merlin'
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

function App () {
  const initialRecords: Game[] = lines
    .map(({ Hero: { Card: { ID } }, Placement }) => ({
      hero: HeroIDs[ID] ?? 'Unknown',
      placement: Placement,
      mmr: Math.round(-100 + (25 * (8 - Placement)) - 10 + (Math.random() * 20))
    })
    )
  const [records, setRecords] = useState(initialRecords)

  const [startingMMR, _setStartingMMR] = useState(0)
  const setStartingMMR: FocusEventHandler<HTMLHeadingElement> = (event) => void _setStartingMMR(parseInt(event?.target.innerText))

  const setMMR = (index: number, mmr: number) => {
    console.log(index, mmr, records[index])
    const record = {
      hero: records[index].hero,
      placement: records[index].placement,
      mmr
    }

    const newRecords = [...records.slice(0, index), record, ...records.slice(index + 1)]
    console.log(newRecords)
    setRecords(newRecords)
  }

  const current = records.reduce((sum, { mmr }) => mmr + sum, startingMMR)

  return (
    <div className='App'>
      <header className='App-header'>
        <h2>mmr</h2>
        <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            flex: 1,
	    width: 300,
            justifyContent: 'space-between'
          }}
        >
          <span>
            <h2>starting</h2>
            <h1 contentEditable onBlur={setStartingMMR}>{startingMMR}</h1>
          </span>
          <span>
            <h2>current</h2>
            <h1>{current}</h1>
          </span>
        </div>

        <h2>scores</h2>
        <div style={{ flexDirection: 'column' }}>
          {records.map((recordProps, index) => (
            <Record key={index} {...recordProps} setMMR={(mmr) => setMMR(index, mmr)} />
	  ))}
        </div>
      </header>
    </div>
  )
}

type Placement = number
const isPlacement = (placement: number): placement is Placement => placement > 0 && placement <= 8

type Mmr = number

interface Game {
  hero: Hero
  placement: Placement
  mmr: Mmr
}

type SetMMR = { setMMR: (mmr: number) => void }
function Record ({ hero, placement, mmr, setMMR }: Game & SetMMR, index: number) {
  const heroUri = `/assets/cards/SBB_HERO_${hero.toUpperCase()}.png`
  const fontSize = 80
  const textShadow = '6px 6px 2px black'

  const updateMMR: FocusEventHandler<HTMLHeadingElement> = (event) => void setMMR(parseInt(event?.target.innerText))

  return (
    <div
      className='record'
      style={{
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'end'
      }}
      key={index}
    >
      <span
        style={{
          fontSize,
          textShadow: '6px 6px 2px black',
          width: '161px',
          height: '204px',
          display: 'block',
          backgroundImage: `url(${heroUri})`,
          fontWeight: 'bold'
        }}
      >
        {placement === 1 ? '👑' : placement}
      </span>

      <span
        contentEditable
        onBlur={updateMMR}
        style={{
          fontSize,
          textShadow,
          textAlign: 'end',
          flexGrow: 1
        }}
      >
        {mmr > 0 ? `+${mmr}` : mmr}
      </span>
    </div>
  )
}
