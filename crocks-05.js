import State from 'crocks/State'
import { get, modify } from 'crocks/State'
const compose = require('crocks/helpers/compose')
const curry = require('crocks/helpers/curry')
const assign = require('crocks/helpers/assign')
import liftA2 from 'crocks/helpers/liftA2'
import option from 'crocks/pointfree/option'
import prop from 'crocks/Maybe/prop'

// State s a
// State.of :: a -> State s a

// getWord :: Number -> String -> String
const getWord =
  indx => str => str.split(' ')[indx] || ''

// nameify :: String -> String -> String
const nameify =
  first => last => `${last}, ${first}`

// getFirst :: State String
const getFirst =
  get(getWord(0))

// getlast :: State String
const getlast =
  get(getWord(1))

// ap :: State s (a -> b) ~> State a -> State b
// State.of :: a -> State s a

// format :: State String
const format = 
  //getFirst // 1
  //.chain(f => getlast.map(nameify(f)))
  //State.of(nameify) // 2
  //.ap(getFirst)
  //.ap(getlast)
  //getFirst // 3
  //.map(nameify)
  //.ap(getlast)
  liftA2(nameify, getFirst, getlast) // 4

console.log(
  format.runWith('Robert Paulson').inspect()  
)

const data = {
  firstName: 'Bobby',
  lastName: 'Pickles',
  fullName: 'Bobby Pickles'
}

// joinWords :: String -> String -> String
const joinWords = curry(
  (x, y) => `${x} ${y}`
)

// updateFirstName :: String -> State User ()
const updateFirstName = curry(
  firstName => compose(
    buildFullName,
    assign({ firstName })
  )
)

// updateFullName :: String -> User -> User
const updateFullName = curry(
  fullName => assign({ fullName })
)

// buildFullName :: User -> User
function buildFullName(user) {
  const { firstName, lastName } = user
  const fullName =
    joinWords(firstName, lastName)
  return updateFullName(fullName, user)
}

console.log(
  updateFirstName('Jimmy', data)
)

// propOr :: (String, a) -> Object -> b
const propOr = (key, def) =>
  compose(option(def), prop(key))

// getFirstName :: () -> State User String
const getFirstName = () =>
  get(propOr('firstName', ''))

// getLastName :: () -> State User String
const getLastName = () =>
  get(propOr('lastName', ''))

// updateFirst :: String -> State User ()
const updateFirst = firstName =>
  modify(assign({ firstName }))
  .chain(buildFull)

// updateFull :: String -> State User ()
const updateFull = fullName =>
  modify(assign({ fullName }))

// buildFull :: () -> State User ()
const buildFull = () =>
  liftA2(joinWords, getFirstName(), getLastName())
  .chain(updateFull)

console.log(
  updateFirst('Jimmy').execWith(data)
)
