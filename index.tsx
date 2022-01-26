import React, { ReactElement, useEffect, useState, useRef } from 'react'
import { fs, os, path } from '@tauri-apps/api'
import { parseLog } from './log.js'
import ReactDOM from 'react-dom'
import './index.css'
// @ts-expect-error
import defaultLog from './Player.log.txt'
// @ts-expect-error
import templateIds from './build/SBBTracker/assets/template-ids.json'

const StartingMMR: React.FC<{ onChange: (mmr: number) => void }> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

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

const CurrentMMR: React.FC<{ startingMMR: number, records?: Game[] }> = ({ startingMMR, records }) => {
  const [currentMMR, setCurrentMMR] = useState(0)

  useEffect(() => {
    if (records == null) return
    setCurrentMMR(records?.reduce((sum, { mmr }) => mmr + sum, startingMMR))
  }, [records, startingMMR])

  return (
    <span style={{ padding: '20px' }}>
      <label htmlFor='currentMMR'>current mmr</label>
      <input
        id='currentMMR'
        type='number' min={0} max={9999} step={100}
        value={currentMMR}
        readOnly
      />
    </span>
  )
}

const useLogpath = async () => {
  const logfile = 'Player.log'

  const platform = await os.platform()
  if (platform !== 'windows') return logfile

  const datadir = (await path.dataDir()).replace('Roaming', 'LocalLow')
  return [datadir, 'Good Luck Games', 'Storybook Brawl', logfile].join(path.sep)
}

const useReadloop = (path: string, pollseconds: number) => {
  const [text, setText] = useState<string>(defaultLog)

  useInterval(() => {
    fs.readTextFile(path)
      .then(setText)
      .catch(console.error)
  }, pollseconds * 1000)

  return text
}

const useInterval = (callback: () => void, delay: number) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!delay && delay !== 0) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

const useRecords = () => {
  const [records, setRecords] = useState<Game[]>()

  const [logpath, setLogpath] = useState('')
  useLogpath().then(setLogpath)

  const text = useReadloop(logpath, 60)

  useEffect(() => {
    if (text == null) return
    const lines = parseLog(text)
    setRecords(lines.map(
      ({ CardTemplateId, Placement, RankReward }) => ({
        hero: templateIds[CardTemplateId],
        placement: Placement,
        mmr: RankReward
      })
    ))
  }, [text])

  return records
}

function App(): ReactElement {
  const [startingMMR, setStartingMMR] = useState(0)
  const records = useRecords()

  return (
    <div className='app'>
      <header>
        <h4>sbb match tracker</h4>
      </header>

      <section className='mmr' style={{ flex: 1, flexDirection: 'row' }}>
        <StartingMMR onChange={setStartingMMR} />
        <CurrentMMR startingMMR={startingMMR} records={records} />
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
type Hero = {
  Id: string
  Name: string
}
interface Game {
  hero: Hero
  placement: Placement
  mmr: Mmr
}

const MMR = new Intl.NumberFormat('en-US', { signDisplay: 'always' })

const Record: React.FC<Game> = ({ hero, placement, mmr }) => {
  const heroUri = `/assets/cards/${hero.Id}.png`
  const textShadow = '6px 6px 2px black'
  const imageSize = 200
  const fontSize = imageSize / 3

  return (
    <div
      className='record'
      style={{ display: 'flex' }}
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
        style={{
          fontSize,
          textShadow,
        }}
      >
        {MMR.format(mmr)}
      </span>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
)
