import React, { ReactElement, useEffect, useState, useRef } from 'react'
import { fs, os, path } from '@tauri-apps/api'
import { parseLog } from './log.js'
import ReactDOM from 'react-dom'
import './index.css'
import heroImages from './heroImages.js'
// @ts-expect-error
import templateIds from './vendor/SBBTracker/assets/template-ids.json'

const Mmr: React.FC<{records: Game[]}> = ({ records }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mmr, setMmr] = useState(3000)
  const [startingMmr, setStartingMmr] = useState(3000)

  // If the records change, update the mmr
  useEffect(() => {
    setMmr(startingMmr + records.reduce((total, { mmr }) => total + mmr, 0))
  }, [records])

  // If the mmr changes, update the startingMmr
  useEffect(() => {
    setStartingMmr(mmr - records.reduce((total, { mmr }) => total + mmr, 0))
  }, [mmr])

  return (
    <div style={{ marginTop: '1em', marginBottom: '1em' }}>
      <input
        ref={inputRef}
        id='mmr'
        style={{
          borderWidth: 0,
          color: 'goldenrod',
          fontSize: '1.5em',
          width: '3em',
          backgroundColor: 'hsl(240, 8%, 8%)'
        }}
        type='number' min={0} max={9999} step={100}
        onChange={() => inputRef?.current !== null && setMmr(inputRef.current.valueAsNumber)}
        list='defaultMMRs'
        defaultValue={mmr}
      />
      <datalist id='defaultMMRs'>
        <option value='1000' />
        <option value='2000' />
        <option value='3000' />
        <option value='4000' />
        <option value='5000' />
      </datalist>
      <label style={{ color: 'goldenrod' }} htmlFor='startingMMR'>mmr</label>
    </div>
  )
}

const useLogpath = async (): Promise<string|null> => {
  const platform = await os.platform()
  if (platform !== 'windows') return null

  const home = await path.homeDir()
  const data = ['AppData', 'LocalLow', 'Good Luck Games', 'Storybook Brawl']
  const logpath = await path.resolve(home, ...data, 'Player.log')
  return logpath
}

/** Given a path, poll to reread  */
const useReadloop = (pollseconds: number, getPath: () => string|null): string => {
  const [text, setText] = useState('')

  useInterval(() => {
    const path = getPath()
    if (path == null) return
    fs.readTextFile(path)
      .then(setText)
      .catch(console.error)
  }, pollseconds * 1000)

  return text
}

const useInterval = (callback: () => void, delay: number): void => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === 0) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

const useRecords = (): Game[] => {
  const [records, setRecords] = useState<Game[]>([])
  const [logpath, setLogpath] = useState<string|null>(null)
  const text = useReadloop(10, () => logpath)

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

  void useLogpath().then(setLogpath)
  return records
}

function App (): ReactElement {
  const records = useRecords()

  return (
    <div className='app'>
      <section style={{ flex: 1 }}>
        <Mmr records={records} />
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

interface Hero {
  Id: string
  Name: string
}

interface Game {
  hero: Hero
  placement: Placement
  mmr: number
}

const formatMMR = (new Intl.NumberFormat('en-US', { signDisplay: 'always' })).format

const Record: React.FC<Game> = ({ hero, placement, mmr }) => {
  const heroName = hero.Id.replace('SBB_HERO_', '').replace(',', '_').replace('-', '_')
  const heroImage = heroImages[heroName]

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
          backgroundImage: `url(${heroImage})`,
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
        {formatMMR(mmr)}
      </span>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
)
