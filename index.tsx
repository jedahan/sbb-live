import React, { FocusEventHandler, ReactElement, useEffect, useState, useRef } from 'react'
import { fs, os, path } from '@tauri-apps/api'
import { parseLog } from './log.js'
import ReactDOM from 'react-dom'
import './index.css'
// @ts-expect-error
import defaultLog from './2021-07-player.log.txt'

const heros = ['Merlin', 'Sharebear', 'Mordred', 'Apocalypse'] as const
type Hero = typeof heros[number]

const HeroIDs: Record<string, Hero> = {
  '5e525924-1173-46c8-89c6-4729777818df': 'Merlin'
}

const StartingMMR: React.FC<{onChange: (mmr: number) => void}> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement|null>(null)

  const setStartingMMR = (): void => {
    if (inputRef?.current == null) return
    onChange(inputRef.current.valueAsNumber)
  }

  return (
    <div style={{ padding: '20px' }}>
      <label htmlFor='startingMMR'>starting mmr</label>
      <input
        ref={inputRef}
        id='startingMMR'
        type='number' min={0} max={9999} step={100}
        onChange={setStartingMMR}
        list='defaultMMRs'
      />
      <datalist id='defaultMMRs'>
        <option value='1000' />
        <option value='2000' />
        <option value='3000' />
        <option value='4000' />
        <option value='5000' />
      </datalist>
    </div>
  )
}

const CurrentMMR: React.FC<{mmr: number}> = ({ mmr }) => (
  <span style={{ padding: '20px' }}>
    <label htmlFor='currentMMR'>current mmr</label>
    <input
      id='currentMMR'
      type='number' min={0} max={9999} step={100}
      value={mmr}
      readOnly
    />
  </span>
)

function App (): ReactElement {
  const [records, setRecords] = useState<Game[]>()
  const [logFile, setLogFile] = useState<string>()
  const [text, setText] = useState<string>(defaultLog)
  const [logTimeout, setLogTimeout] = useState<NodeJS.Timer>()
  const [startingMMR, setStartingMMR] = useState(0)

  const [platform, setPlatform] = useState<string>()
  const inputRef = useRef(null)

  os.platform()
    .then(setPlatform)
    .catch(console.error)

  useEffect(() => {
    if (platform == null) return
    if (platform !== 'win32') return

    path.dataDir()
      .then(dataDir => {
        const logpath = [`${dataDir}Low`, 'Good Luck Games', 'Storybook Brawl', 'Player.log'].join(path.sep)
        setLogFile(logpath)
      })
      .catch(console.error)
  }, [platform])

  useEffect(() => {
    if (logFile == null) return
    if (logTimeout !== undefined) return

    setLogTimeout(
      setInterval(() => {
        fs.readTextFile(logFile)
          .then(setText)
          .catch(console.error)
      }, 60 * 1000)
    )
  }, [logFile, logTimeout])

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
    <div className='app'>
      <header>
        <h4>sbb match tracker</h4>
      </header>

      <section className='mmr' style={{ flex: 1, flexDirection: 'row' }}>
        <StartingMMR onChange={setStartingMMR} />
        <CurrentMMR mmr={current ?? 0} />
      </section>

      <section className='scores'>
        <h2>scores</h2>

        <div style={{ flexDirection: 'column' }}>
          {records?.map(({ hero, mmr, placement }, index) => (
            <Record
              key={index}
              hero={hero}
              mmr={mmr}
              placement={placement}
              setMMR={(mmr: number) => setMMR(index, mmr)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

/** Placement should be an integer between 1 and 8 inclusive */
type Placement = number

/** Mmr should be a positive integer */
type Mmr = number
interface Game {
  hero: Hero | 'Unknown'
  placement: Placement
  mmr: Mmr
}

interface SetMMR { setMMR: (mmr: number) => void }

const Record: React.FC<Game & SetMMR> = ({ hero, placement, mmr, setMMR }) => {
  const heroUri = `/assets/cards/SBB_HERO_${hero.toUpperCase()}.png`
  const textShadow = '6px 6px 2px black'
  const imageSize = 100
  const fontSize = imageSize / 3

  const updateMMR: FocusEventHandler<HTMLSpanElement> = (event) =>
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
          width: `${imageSize}px`,
          display: 'block',
          backgroundImage: `url(${heroUri})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          fontWeight: 'bold'
        }}
      >
        {placement === 1 ? '👑' : placement}
      </span>

      <span
        contentEditable
        suppressContentEditableWarning
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

ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
)