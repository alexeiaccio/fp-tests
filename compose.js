// curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
function curry(fn) {
  const arity = fn.length
  return function $curry(...args) {
    if (args.length < arity) {
      return $curry.bind(null, ...args)
    }
    return fn.call(null, ...args)
  }
}

const trace = curry((tag, x) => (console.log(tag, x), x))

// reduce :: (b -> a -> b) -> b -> [a] -> b
const reduce = curry((fn, zero, xs) => xs.reduce(fn, zero))

// replace :: RegExp -> String -> String -> String
const replace = curry((re, rpl, str) => str.replace(re, rpl))

// map :: (a -> f b) -> f a -> f b
// const map = curry((fn, f) => f.map(fn))
// map :: Functor f => (a -> b) -> f a -> f b
const map = curry((f, anyFunctor) => anyFunctor.map(f))

// join :: (a, [a]) -> a
const join = curry((con, xs) => xs.join(con))

// id :: a -> a
const id = x => x

// split :: String -> String -> [String]
const split = curry((sep, str) => str.split(sep))

// prop :: String -> Object -> a
const prop = curry((p, obj) => obj[p])

// add :: Number -> Number -> Number
const add = curry((a, b) => a + b)

// filter :: (a -> Boolean) -> [a] -> [a]
const filter = curry((fn, xs) => xs.filter(fn))

// flip :: (a -> b) -> (b -> a)
const flip = curry((fn, a, b) => fn(b, a))

// concat :: String -> String -> String
const concat = curry((a, b) => a.concat(b))

// compose :: (a, b) -> a -> b
// const compose = (f, g) => x => f(g(x))
// compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
function compose(...fns) {
  const n = fns.length
  return function $compose(...args) {
    let $args = args
    for (let i = n - 1; i >= 0; i -= 1) {
      $args = [fns[i].call(null, ...$args)]
    }
    return $args[0]
  }
}

// sortBy :: Ord b => (a -> b) -> [a] -> [a]
const sortBy = curry((fn, xs) => {
  return xs.sort((a, b) => {
    if (fn(a) === fn(b)) {
      return 0
    }
    return fn(a) > fn(b) ? 1 : -1
  })
})

// allNext :: a -> a
const toUpperCase = x => x.toUpperCase()
const toLowerCase = x => x.toLowerCase()
const exclaim = x => x + '!'
const angry = compose(exclaim, toUpperCase)
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase)
const shout = compose(exclaim, snakeCase)

// head :: [a] -> a
const head = xs => xs[0]
// reverse :: [a] -> [a]
const reverse = reduce((acc, x) => [x].concat(acc), [])
// last :: [a] -> a
const last = xs => xs[xs.length - 1]

const initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '))
const latin = compose(map(initials), map(angry), reverse)
latin(["frog moo", "blue eyes"])

const lastUpper = compose(toUpperCase, head, reverse)
const loudLastUpper = compose(exclaim, toUpperCase, head, reverse)


const dasherize = compose(join('-'), map(toLowerCase), split(' '), replace(/\s{2,}/ig, ' '))

const res = dasherize('The world is a vampire')

// EXERCISE
const CARS = [
  {name: "Ferrari FF", horsepower: 660, dollar_value: 700000, in_stock: true},
  {name: "Spyker C12 Zagato", horsepower: 650, dollar_value: 648000, in_stock: false},
  {name: "Jaguar XKR-S", horsepower: 550, dollar_value: 132000, in_stock: false},
  {name: "Audi R8", horsepower: 525, dollar_value: 114200, in_stock: false},
  {name: "Aston Martin One-77", horsepower: 750, dollar_value: 1850000, in_stock: true},
  {name: "Pagani Huayra", horsepower: 700, dollar_value: 1300000, in_stock: false}
]

// prop :: [Object] -> a
const isLastInStock = compose(prop('in_stock'), last)
const nameOfFirstCar = compose(prop('name'), head)

const average = xs => reduce(add, 0, xs)/xs.length
const averageDollarValue = compose(average, map(prop('dollar_value')))

const underscore = replace(/\W+/g, '_')
const sanitizeNames = compose(map(underscore), map(prop('name')))

const toString = x => `${x}`
const extractTwoLast = str => str.slice(0, str.length-2)
const separateNumberClass = reduce((acc, x, index, xs) => index % 4 === 1 ? acc += `${x} ` : acc += `${x}`, '')
const dollarize = x => `$${x}.00`
const accounting = compose(dollarize, separateNumberClass, split(''), extractTwoLast, toString)
const availablePrices = compose(map(accounting), map(prop('dollar_value')), filter(prop('in_stock')))
const append = flip(concat)

const fastestCar = compose(append(' is fastest!'), prop('name'), last, sortBy(prop('horsepower')))


console.log(isLastInStock(CARS))
console.log(nameOfFirstCar(CARS))
console.log(averageDollarValue(CARS))
console.log(sanitizeNames(CARS))
console.log(availablePrices(CARS))
console.log(fastestCar(CARS))
