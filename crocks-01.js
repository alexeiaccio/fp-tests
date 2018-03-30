import State from 'crocks/State'
import { get } from 'crocks/State'
import Pair from 'crocks/Pair'
import compose from 'crocks/helpers/compose'

// State s a
// (s -> Pair(a, s))

// m :: State Number
const m = State(state => Pair(state + 5, state))

console.log(
  m.runWith(45).inspect(),
  m.runWith(45).fst(),
  m.runWith(45).snd()
)

// updateValue :: Number -> State Number
const updateValue = x => State(s => Pair(s + x, s))

// updateState :: Number -> State Number
const updateState = x => State(s => Pair(s, s + x))

console.log(
  updateValue(10).runWith(45).inspect(),
  updateValue(10).runWith(45).fst(),
  updateState(10).runWith(45).snd()
)

// add :: Number -> Number -> Number
const add =
x => y => x + y

// pluralize :: (String, String) -> Number -> String
const pluralize =
(single, plural) => num =>
  `${num} ${Math.abs(num) === 1 ? single : plural}`

// getState :: () -> State s
// get(crocks/State) :: () -> State s
const getState = () => State(s => Pair(s, s))

// makeAwesome :: Number -> String
const makeAwesome = pluralize('Awesome', 'Awesomes')

// flow :: Number -> String
const flow = compose(
  makeAwesome,
  add(10)
)

// map :: State s a ~> (a -> b) -> State s b

console.log(
  getState()
  .map(add(10))
  .map(makeAwesome)
  .runWith(10)
  .inspect()
)

console.log(
  get()
  .map(flow)
  .runWith(-9)
  .inspect()
)

