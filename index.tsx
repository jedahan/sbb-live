import React, { FocusEventHandler, ReactElement, useEffect, useState, useRef } from 'react'
import { fs, os, path } from '@tauri-apps/api'
import { parseLog } from './log.js'
import ReactDOM from 'react-dom'
import './index.css'
import defaultLog from './2021-07-player.log.txt'

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
  const [logFile, setLogFile] = useState<string>()
  const [text, setText] = useState<string>(defaultLog)
  const [logTimeout, setLogTimeout] = useState<NodeJS.Timer>()

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

  // TODO: Figure out how to tail the file
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
  const setStartingMMR: FocusEventHandler<HTMLInputElement> = () => {
    if (!(inputRef && inputRef.current)) return
    _setStartingMMR(parseInt(inputRef.current.value))
  }

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
            <input ref={inputRef}
              type={"number"} min={0} max={9999} step={100}
              onChange={setStartingMMR}
              placeholder={`${startingMMR}`}
              list="defaultMMRs"
              style={{
                width: '6em'
              }}
              />
            <datalist id="defaultMMRs">
              <option value="1000" />
              <option value="2000" />
              <option value="3000" />
              <option value="4000" />
              <option value="5000" />
            </datalist>
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
  const textShadow = '6px 6px 2px black'
  const imageSize = 100
  const fontSize = imageSize / 3

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
