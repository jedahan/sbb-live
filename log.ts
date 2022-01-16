// @ts-ignore start
import log from './2021-07-player.log.txt'
// @ts-ignore end

const lines: string[] = log.split('\r\n')


interface SomeObject extends Record<string, string | number | SomeObject> {}

interface EnterResultsPhase extends Action {
  Hero: {
    Card: {
      ID: string
    }
  }
  Placement: number
}

interface Action extends SomeObject {
  Typeint: string
}

function parseObjectString (objectString: string): SomeObject {
  const [key, ...values] = objectString
    .split(':')
    .map(item => item.trim())

  if (values.length > 1) return { [key]: parseObjectString(values.join(':')) }

  return { [key]: key === 'Placement' ? parseInt(values[0]) : values[0] }
}

function isEnterResultsPhase(action: Action): action is EnterResultsPhase {
  return action.Type === 'GLG.Transport.Actions.ActionEnterResultsPhase'
}

function isAction(action: Partial<SomeObject>): action is Action {
  return 'Type' in action
}

function parseAction (actionString: string): Action {
  if (!actionString.startsWith('- Action:')) throw new Error('Unknown action format')

  const action = actionString
    .replace('- Action:', '')
    .split('|')
    .map(parseObjectString)
    .reduce((act, property) => Object.assign(act, property), {})

  if (!isAction(action)) throw new Error('no action')
  return action
}

const actions = lines
  .filter(line => line.startsWith('- Action:'))
  .map(parseAction)
  .filter(isEnterResultsPhase)
  .slice(-10)

export default actions
