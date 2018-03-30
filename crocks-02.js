import { get } from 'crocks/State'
import prop from 'crocks/Maybe/prop'
import option from 'crocks/pointfree/option'
import compose from 'crocks/helpers/compose'
import objOf from 'crocks/helpers/objOf'

// get(crocks/State) :: () -> State s

// data
const burgers =
  { burgers: 4 }

const tacos =
  { tacos: 10 }

// getBurgers :: State Object (Maybe a)
const getBurgers = 
get()
.map(prop('burgers'))

// getTacos :: State Object a
const getTacos = 
  get(prop('tacos'))
    .map(option(0))

console.log(
  getBurgers.runWith(burgers).fst().inspect(),
  getBurgers.runWith(burgers).snd(),
  getTacos.evalWith(burgers),
  getTacos.evalWith(tacos),
  getTacos.runWith(tacos).snd()
)

// defaultProp :: (String, a) -> Object -> b
const defaultProp = (key, def) =>
  compose(option(def), prop(key))

// getDefault :: State Object a
const getDefault = 
  get(defaultProp('burgers', 0))

// burgersToTacos :: State Object
const burgersToTacos = 
  getDefault
    .map(objOf('tacos'))

console.log(
  getDefault.evalWith(burgers),
  getDefault.evalWith(tacos),
  burgersToTacos.evalWith(burgers)
)
