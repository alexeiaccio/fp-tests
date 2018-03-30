import State from 'crocks/State'
import { put } from 'crocks/State'
import { modify } from 'crocks/State'
import Pair from 'crocks/Pair'
import Unit from 'crocks/Unit'
import mapProps from 'crocks/helpers/mapProps'

// State s a
// (s -> Pair(a, s))

// putState :: s -> State s ()
const putState = state =>
  State(() => Pair(Unit(), state))

// reset :: () -> State String ()
const reset = () =>
  putState('Grand Canyon')
const reset2 = () =>
  put('Grand Canyon')

console.log(
  putState('Grand Canyon').runWith('EverGreen').inspect(),
  putState('Grand Canyon').evalWith('EverGreen').inspect(),
  putState('Grand Canyon').execWith('EverGreen'),
  reset().execWith('EverGreen'),
  reset2().execWith('EverGreen'),
  reset2().runWith('EverGreen').toString(),
)

const state = { bubbles: 42 }

// add :: Number -> Number -> Number
const add = x => y => x + y

// modifyState :: (s -> s) -> State s ()
const modifyState = fn =>
  State(s => Pair(Unit(), fn(s)))

// blowBubble :: () -> State Object ()
const blowBubble = () =>
  modify(mapProps({ bubbles: add(1)}))

// blowBubbles :: Number -> State Object ()
const blowBubbles = n =>
  modify(mapProps({ bubbles: add(n)}))

// burstBubbles :: Number -> State Object ()
const burstBubbles = n =>
  blowBubbles(-(n))

// burstBubble :: Number -> State Object ()
const burstBubble = n =>
  burstBubbles(1)

console.log(
  modifyState(mapProps({ bubbles: add(10)})).execWith(state),
  blowBubble().execWith(state),
  blowBubbles(11).execWith(state),
  burstBubbles(10).execWith(state),
  burstBubble().execWith(state),
  blowBubbles(11).evalWith(state).inspect(),
)
