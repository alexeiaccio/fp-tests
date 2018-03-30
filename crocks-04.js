import State from 'crocks/State'
import { get, modify } from 'crocks/State'
import constant from 'crocks/combinators/constant'
import composeK from 'crocks/helpers/composeK'

// State s a
// State.of :: a -> State s a
// chain :: State s a ~> (a -> State s b) -> State s b
// (State s) m => a -> m b

// add :: Number -> Number -> Number
const add = 
  x => y => x + y

// multiply :: Number -> Number -> Number
const multiply =
  x => y => x * y
  
// inc :: () -> Number
const inc =
  add(1)

// addState :: Number -> State Number
const addState = n =>
  get(add(n))

// incState :: Number -> State Number
const incState = n =>
  modify(inc)
  .map(constant(n))

// multiplyState :: Number -> State Number
const multiplyState = n =>
  get(multiply(n))

// addAndInc :: Number -> State Number
const addAndInc =
  composeK(incState, addState)

// compute :: Number -> State Number
const compute = n =>
  //State.of(n)
  //.map(add(1))
  //.chain(x => get(add(x)))
  //.chain(addState)
  //.chain(incState)
  //.chain(addAndInc)
  addAndInc(n)
  .chain(multiplyState)

const compute2 =
  composeK(multiplyState, addAndInc)

console.log(
  compute(10).evalWith(2),
  compute(10).execWith(2),
  compute2(10).runWith(2).toString()
)
