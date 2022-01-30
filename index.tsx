import React, { ReactElement, useEffect, useState, useRef } from 'react'
import { fs, os, path } from '@tauri-apps/api'
import { parseLog } from './log.js'
import ReactDOM from 'react-dom'
import './index.css'
// @ts-expect-error
import defaultLog from './Player.log.txt'
// @ts-expect-error
import templateIds from './build/SBBTracker/assets/template-ids.json'

const StartingMMR: React.FC<{ onChange: (mmr: number) => void, startingMMR: number }> = ({ onChange, startingMMR }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const setStartingMMR = (): void => {
    if (inputRef?.current == null) return
    onChange(inputRef.current.valueAsNumber)
  }

  const fontSize = '1.5em'

  return (
    <div style={{marginTop: '1em', marginBottom: '1em'}}>
      <input
        ref={inputRef}
        id='startingMMR'
        style={{
          borderWidth: 0,
          color: 'white',
          fontSize,
          width: '4em',
          backgroundColor: 'hsl(240, 8%, 8%)',
        }}
        type='number' min={0} max={9999} step={100}
        onChange={setStartingMMR}
        list='defaultMMRs'
        defaultValue={startingMMR}
      />
      <datalist id='defaultMMRs'>
        <option value='1000' />
        <option value='2000' />
        <option value='3000' />
        <option value='4000' />
        <option value='5000' />
      </datalist>
      <label htmlFor='startingMMR'>starting</label>
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
    <div>
      <span style={{
        color: 'goldenrod',
        fontSize: 'xx-large'
      }}>{currentMMR} mmr</span>
    </div>
  )
}

const useLogpath = async () => {
  const platform = await os.platform()
  if (platform !== 'windows') return null

  const home = await path.homeDir()
  return path.resolve(home, 'LocalLow', 'Good Luck Games', 'Storybook Brawl', 'Player.log')
}

/** Given a path, poll to reread  */
const useReadloop = (pollseconds: number, path: string | null) => {
  const [text, setText] = useState<string>(defaultLog)

  useInterval(() => {
    if (path == null) return
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

  const [logpath, setLogpath] = useState<string|null>(null)
  useLogpath().then(setLogpath)

  const text = useReadloop(60, logpath)

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
  const [startingMMR, setStartingMMR] = useState(4000)
  const records = useRecords()

  return (
    <div className='app'>
      <section style={{ flex: 1 }}>
        <CurrentMMR startingMMR={startingMMR} records={records} />
        <StartingMMR startingMMR={startingMMR} onChange={setStartingMMR} />
      </section>

      <section className='scores'>
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

  return (
    <div
      className='record'
      style={{ display: 'flex', flexDirection: 'row', alignContent: 'space-between' }}
    >
      <span
        style={{
          fontSize: '4em',
          textShadow: '6px 6px 2px black',
          width: '1.5em',
          backgroundImage: `url(${heroUri})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          fontWeight: 'bold'
        }}
      >
        {placement === 1 ? '👑' : placement}
      </span>

      <span
        style={{
          fontSize: '2em',
          flexGrow: 1,
          alignSelf: 'flex-end',
          textAlign: 'end'
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
