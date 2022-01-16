import log from './2021-07-player.log.txt'

const lines: string[] = log.split('\r\n')

const resultsPhase = 'GLG.Transport.Actions.ActionEnterResultsPhase'

interface SomeObject extends Record<string, string | SomeObject> {}

interface CardObject extends SomeObject {
  Type: string
}

function parseObjectString(objectString: string): CardObject | SomeObject | null {
  if (objectString == null || objectString === "") return null

  const [key, ...values] = objectString
    .split(':')
    .map(item => item.trim())

  if (values.length === 0) return null
  if (values.length === 1) return { [key]: values[0] }

  const value = parseObjectString(values.join(':'))
  if (value) return { [key]: value }
  return null
}

function parseAction(actionString: string) {
  if (!actionString.startsWith('- Action:')) throw new Error('Unknown action format')

  const action = actionString
      .replace('- Action:','')
      .split('|')
      .map(parseObjectString)

  return action
}

const actions = lines
  .filter(line => line.startsWith('- Action:'))
  .map(parseAction)
  .map(props => Object.assign(...props, {}))
  .filter(card => card?.Type === resultsPhase)
  .slice(-10)

export default actions
