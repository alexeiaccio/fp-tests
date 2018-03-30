import compose from 'folktale/core/lambda/compose'
import curry from 'folktale/core/lambda/curry'
import constant from 'folktale/core/lambda/constant'
import identity from 'folktale/core/lambda/identity'
import partialize from 'folktale/core/lambda/partialize'
import fromPairs from 'folktale/core/object/from-pairs'
import toPairs from 'folktale/core/object/to-pairs'
import values from 'folktale/core/object/values'
import mapEntries from 'folktale/core/object/map-entries'
import mapValues from 'folktale/core/object/map-values'

const then   = compose.infix
const inc    = (x) => x + 1
const double = (x) => x * 2;

const res = inc::then(double)(2)

const upcase  = (name) => name.toUpperCase()
const map = curry(2, (transform, items) => items.map(transform))
const join = curry(2, (separator, items) => items.join(separator))
const prop = curry(2, (key, object) => object[key])
const plus = (a, b, c) => a + b + c
const plusCarried = curry(3, plus)
const subtract = curry(2, (x, y) => x - y)
const flip = curry(3, (f, x, y) => f(y, x))
const _ = partialize.hole

const names = [
  'Alissa', 'Max', 'Talib'
]

const people = [
  { name: 'Alissa', age: 26 },
  { name: 'Max',    age: 19 },
  { name: 'Talib',  age: 28 }
]

const showNames = map(upcase)::then(join(', '))

let counter = 0
const next = () => ++counter
const nexted = map(constant(next()))
const nextedId = map(identity)
const peopleNames = map(prop('name'))

const clamp = (min, max, number) =>
  number < min ?  min
: number > max ?  max
:                 number

const clamp_ = partialize(3, clamp)
const atLeast = clamp_(_, Infinity, _)
const atMost  = clamp_(-Infinity, _, _)

/*~ 
* ---
* type: (Array (String or Symbol, 'a)) => Object 'a 
*/
const objFromPair = fromPairs([['x', 10], ['y', 20]])

const pair = { x: 10, y: 20 }

/*~ 
* ---
* type: (Object 'a) => Array (String or Symbol, 'a) 
*/
const newPair = toPairs(pair)

const updatePair = mapEntries(
  pair,
  ([key, value]) => [key.toUpperCase(), value * 2],
  (result, key, value) => {
    result[key] = value
    return result
  }
)

console.log(
  res, 
  showNames(names),
  nexted([1,2,3]),
  nextedId([1,2,3]),
  peopleNames(people),
  showNames(peopleNames(people)),
  plusCarried(1, 2, 3, 4),
  flip(subtract, 1, 2),
  atLeast(3, 2),
  atMost(5, 10),
  objFromPair,
  newPair,
  values(pair),
  updatePair,
  mapValues(pair, x => x * 3)
)

/*~ 
* ---
* type: (Number, Number) => Number
*/
function add(a, b) {
  return a + b;
}

console.log(
  add(1, 2),
  add(1, "2")
)

