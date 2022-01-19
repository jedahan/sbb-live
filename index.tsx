import { fs, os } from '@tauri-apps/api'
import React, { FocusEventHandler, ReactElement, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { parseLog } from './log.js'

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

function App (): ReactElement {
  const [records, setRecords] = useState<Game[]>()
  const [text, setText] = useState<string>()
  const [platform, setPlatform] = useState<string>()
  os.platform().then(setPlatform).catch(() => console.error('unknown platform'))

  useEffect(() => {
    if (platform == null) return
    // TODO: allow setting folder path manually
    // FIXME: don't hardcode my user path lol
    const root = platform === 'win32'
      ? 'C:\Users\micro\AppData\LocalLow\Good Luck Games\Storybook Brawl'
      : '/Users/micro/src/sbb-match-tracker'

    fs.readTextFile(`${root}/Player.log`)
      .then(setText)
      .catch(console.error)
  }, [platform])

  // TODO: update file when ?
  useEffect(() => {
    if (text == null) return
    const lines = parseLog(text)

    setRecords(lines.map(
      ({ Hero: { Card: { ID } }, Placement }) => ({
        hero: HeroIDs[ID] ?? 'Unknown',
        placement: Placement,
        mmr: Math.round(-100 + 25 * (8 - Placement) - 10 + Math.random() * 20)
      })
    ))
  }, [text])

  const [startingMMR, _setStartingMMR] = useState(0)
  const setStartingMMR: FocusEventHandler<HTMLHeadingElement> = (event) =>
    _setStartingMMR(parseInt(event?.target.innerText, 10))

  const setMMR = (index: number, mmr: number): void => {
    if (records?.[index] == null) return

    const record = {
      hero: records[index].hero,
      placement: records[index].placement,
      mmr
    }

    const newRecords = [
      ...records.slice(0, index),
      record,
      ...records.slice(index + 1)
    ]
    setRecords(newRecords)
  }

  const current = records?.reduce((sum, { mmr }) => mmr + sum, startingMMR)

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
            <h1 contentEditable onBlur={setStartingMMR}>
              {startingMMR}
            </h1>
          </span>
          <span>
            <h2>current</h2>
            <h1>{current}</h1>
          </span>
        </div>

        <h2>scores</h2>

        <div style={{ flexDirection: 'column' }}>
          {records?.map(({ hero, mmr, placement }, index) => (
            <Record
              key={index}
              hero={hero}
              mmr={mmr}
              placement={placement}
              setMMR={(mmr) => setMMR(index, mmr)}
            />
          ))}
        </div>
      </header>
    </div>
  )
}

/** Placement should be an integer between 1 and 8 inclusive */
type Placement = number

/** Mmr should be a positive integer */
type Mmr = number
interface Game {
  hero: Hero
  placement: Placement
  mmr: Mmr
}

interface SetMMR { setMMR: (mmr: number) => void }

const Record: React.FC<Game & SetMMR> = ({ hero, placement, mmr, setMMR }) => {
  const heroUri = `/assets/cards/SBB_HERO_${hero.toUpperCase()}.png`
  const fontSize = 80
  const textShadow = '6px 6px 2px black'

  const updateMMR: FocusEventHandler<HTMLHeadingElement> = (event) =>
    setMMR(parseInt(event?.target.innerText))

  return (
    <div
      className='record'
      style={{
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'end'
      }}
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
