interface SomeObject extends Record<string, string | number | SomeObject> {}
export interface EnterResultsPhaseAction extends Action {
  CardTemplateId: number
  RankReward: number
  Placement: number

}
interface Action extends SomeObject {
  Typeint: string
}

function parseObjectString (objectString: string): SomeObject {
  const [key, ...values] = objectString.split(':').map((item) => item.trim())

  if (values.length > 1) return { [key]: parseObjectString(values.join(':')) }

  return { [key]: ['RankReward', 'CardTemplateId', 'Placement'].includes(key) ? parseInt(values[0]) : values[0] }
}

function isEnterResultsPhaseAction (
  action: Action
): action is EnterResultsPhaseAction {
  return action.Type === 'GLG.Transport.Actions.ActionEnterResultsPhase'
}

function isAction (action: Partial<SomeObject>): action is Action {
  return 'Type' in action
}

function parseAction (actionString: string): Action {
  const action = actionString
    .replace(/^.*- Action: /,'')
    .split('|')
    .map(parseObjectString)
    .reduce((act, property) => Object.assign(act, property), {})

  if (!isAction(action)) throw new Error('no action')
  return action
}

export function parseLog (text: string): EnterResultsPhaseAction[] {
  return text
    .split('\r\n')
    .filter((line) => line.includes('- Action:'))
    .map(parseAction)
    .filter(isEnterResultsPhaseAction)
    .slice(-10)
}
