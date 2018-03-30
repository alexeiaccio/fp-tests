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

// match :: RegExp -> String -> Boolean
const match = curry((re, str) => re.test(str))

// prop :: String -> Object -> a
const prop = curry((p, obj) => obj[p])

// concat :: String -> String -> String
const concat = curry((a, b) => a.concat(b))

// add :: Number -> Number -> Number
const add = curry((a, b) => a + b)

// map :: Functor f => (a -> b) -> f a -> f b
const map = curry((f, anyFunctor) => anyFunctor.map(f))

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

// head :: [a] -> a
const head = xs => xs[0]

// inspect :: a -> String
function inspect(x) {
  if (x && typeof x.inspect === 'function') {
    return x
  }
  function inspectFn(f) {
    return f.name ? f.name : f.toString()
  }
  function inspectTerm(t) {
    switch (typeof t) {
      case 'string':
        return `'${t}'`
      case 'object': {
        const ts = Object.keys(t).map(k => [k, inspect(t[k])])
        return `{${ts.map(kv => kv.join(': ')).join(', ')}}`
      }
      default:
        return String(t)
    }
  }
  function inspectArgs(args) {
    return Array.isArray(args) ? `[${args.map(inspect).join(', ')}]` : inspectTerm(args)
  }
  return (typeof x === 'function') ? inspectFn(x) : inspectArgs(x)
}

class Container {
  constructor(x) {
    this.$value = x
  }
  static of(x) {
    return new Container(x)
  }
  // ----- Monad Maybe
  chain(fn) {
    return this.map(fn).join();
  }
  // ----- Applicative Identity
  ap(f) {
    return f.map(this.$value);
  }
}

// (a -> b) -> Container a -> Container b
Container.prototype.map = function (f) {
  return Container.of(f(this.$value))
}

/* console.log(Container.of(Container.of({name : 'hotdogs'})).$value.$value)
console.log(Container.of(2).map(two => two + 2).$value)
console.log(Container.of('flaflafla').map(s => s.toUpperCase()))
console.log(Container.of('flaflafla').map(concat(' away')).map(prop('length'))) */

class Identity {
  constructor(x) {
    this.$value = x;
  }

  inspect() {
    return `Identity(${inspect(this.$value)})`;
  }

  // ----- Pointed Identity
  static of(x) {
    return new Identity(x);
  }

  // ----- Functor Identity
  map(fn) {
    return Identity.of(fn(this.$value));
  }

  // ----- Applicative Identity
  ap(f) {
    return f.map(this.$value);
  }

  // ----- Monad Identity
  chain(fn) {
    return this.map(fn).join();
  }

  join() {
    return this.$value;
  }

  // ----- Traversable Identity
  sequence(of) {
    return this.traverse(of, identity);
  }

  traverse(of, fn) {
    return fn(this.$value).map(Identity.of);
  }
}

class Maybe {
  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  get isJust() {
    return !this.isNothing;
  }

  constructor(x) {
    this.$value = x;
  }

  inspect() {
    return `Maybe(${inspect(this.$value)})`;
  }

  // ----- Pointed Maybe
  static of(x) {
    return new Maybe(x);
  }

  // ----- Functor Maybe
  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }

  // ----- Applicative Maybe
  ap(f) {
    return this.isNothing ? this : f.map(this.$value);
  }

  // ----- Monad Maybe
  chain(fn) {
    return this.map(fn).join();
  }

  join() {
    return this.isNothing ? this : this.$value;
  }

  // ----- Traversable Maybe
  sequence(of) {
    this.traverse(of, identity);
  }

  traverse(of, fn) {
    return this.isNothing ? of(this) : fn(this.$value).map(Maybe.of);
  }
}

Maybe.of('Malkovich Malkovich').map(match(/a/ig))
Maybe.of(null).map(match(/a/ig))
Maybe.of({ name: 'Dinah', age: 14 }).map(prop('age')).map(add(10))

// safeHead :: [a] -> Maybe(a)
const safeHead = xs => Maybe.of(xs[0])

// streetName :: Object -> Maybe String
const streetName = compose(map(prop('street')), safeHead, prop('addresses'))

streetName({ addresses: [] })
streetName({ addresses: [{ street: 'Shady Ln.', number: 4201 }] })

// maybe :: b -> (a -> b) -> Maybe a -> b
const maybe = curry((v, f, m) => {
  if (m.isNothing) {
    return v
  }

  return f(m.$value)
})

class List {
  constructor(xs) {
    this.$value = xs;
  }

  inspect() {
    return `List(${inspect(this.$value)})`;
  }

  concat(x) {
    return new List(this.$value.concat(x));
  }

  // ----- Pointed List
  static of(x) {
    return new List([x]);
  }

  // ----- Functor List
  map(fn) {
    return new List(this.$value.map(fn));
  }

  // ----- Traversable List
  sequence(of) {
    return this.traverse(of, identity);
  }

  traverse(of, fn) {
    return this.$value.reduce(
      (f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f),
      of(new List([])),
    );
  }
}

class Either {
  static of(x) {
    return new Right(x)
  }
  constructor(x) {
    this.$value = x
  }
}

class Left extends Either {
  map(f) {
    return this
  }
  inspect() {
    return console.log(`Left(${inspect(this.$value)})`)
  }
}

class Right extends Either {
  map(f) {
    return Either.of(f(this.$value))
  }
  inspect() {
    return console.log(`Right(${inspect(this.$value)})`)
  }
}

const left = x => new Left(x)

Either.of('rain').map(concat('b'))
left('rain').map(str => `It's gonna ${str}, better bring your umbrella!`)

// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = curry((f, g, e) => {
  let result
  switch (e.constructor) {
    case Left:
      result = f(e.$value)
      break
    case Right:
      result = g(e.$value)
      break
    // No Default
  }
  return result
})

class IO {
  constructor(fn) {
    this.unsafePerformIO = fn;
  }

  inspect() {
    return `IO(?)`;
  }

  // ----- Pointed IO
  static of(x) {
    return new IO(() => x);
  }

  // ----- Functor IO
  map(fn) {
    return new IO(compose(fn, this.unsafePerformIO));
  }

  // ----- Applicative IO
  ap(f) {
    return this.chain(fn => f.map(fn));
  }

  // ----- Monad IO
  chain(fn) {
    return this.map(fn).join();
  }

  join() {
    return this.unsafePerformIO();
  }
}

// $ :: String -> IO [DOM]
//const $ = selector => new IO(() => document.querySelectorAll(selector))
//Maybe.of($('#myDiv').map(head).map(div => div.innerHTML).unsafePerformIO())


// reduce :: (b -> a -> b) -> b -> [a] -> b
const reduce = curry((fn, zero, xs) => xs.reduce(fn, zero))
// reverse :: [a] -> [a]

const reverse = reduce((acc, x) => [x].concat(acc), [])

// topRoute :: String -> Maybe String
const topRoute = compose(Maybe.of, reverse)

// bottomRoute :: String -> Maybe String
const bottomRoute = compose(map(reverse), Maybe.of)

topRoute('hi'.split(''))
bottomRoute('hi'.split(''))

// showWelcome :: User -> String
const showWelcome = compose(concat('Welcome '), prop('name'))

// checkActive :: User -> Either String User
const checkActive = function checkActive(user) {
  return user.active
    ? Either.of(user)
    : left('Your account is not active')
}

// eitherWelcome :: User -> Either String String
const eitherWelcome = compose(map(showWelcome), checkActive)

eitherWelcome({ name: 'Hoop', active: true })

// validateUser :: (User -> Either String ()) -> User -> Either String User
const validateUser = curry((validate, user) => validate(user).map(_ => user))

// save :: User -> IO User
const save = user => new IO(() => ({ ...user, saved: true }))

// validateName :: User -> Either String ()
const validateName = ({ name }) => (name.length > 3
  ? Either.of(null)
  : left('Your name need to be > 3')
)

const saveAndWelcome = compose(map(showWelcome), save)

// register :: User -> IO String
const register = compose(either(IO.of, saveAndWelcome), validateUser(validateName))

register({name: 'Aba'}).unsafePerformIO()

// safeProp :: Key -> {Key: a} -> Maybe a
const safeProp = curry((x, obj) => Maybe.of(obj[x]));

// join :: Monad m => m (m a) -> m a
const join = mma => mma.join()

// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = f => compose(join, map(f));

// firstAddressStreet :: User -> Maybe Street
const firstAddressStreet = compose(
  chain(safeProp('street')),
  chain(safeHead), 
  safeProp('addresses'),
)

const user = {  
  id: 1,  
  name: 'Albert',  
  address: {  
    street: {  
      number: 22,  
      name: 'Walnut St',  
    },  
  },  
}

// getStreetName :: User -> Maybe String
const getStreetName = compose(
  chain(safeProp('name')),
  chain(safeProp('street')),
  safeProp('address')
)

const liftA2 = curry((g, f1, f2) => f1.map(g).ap(f2))

const tOfM = compose(Maybe.of, Identity.of)

// safeAdd :: Maybe Number -> Maybe Number -> Maybe Number
const safeAdd = liftA2(add)

safeAdd(Maybe.of(2), Maybe.of(4))

const localStorage = {  
  player1: { id:1, name: 'Albert' },  
  player2: { id:2, name: 'Theresa' },  
}

// getFromCache :: String -> IO User  
const getFromCache = x => new IO(() => localStorage[x])

// game :: User -> User -> String  
const game = curry((p1, p2) => `${p1.name} vs ${p2.name}`)

// startGame :: IO String
const startGame = liftA2(game, getFromCache('player2'), getFromCache('player1'))

// arrayToList :: [a] -> List a
const arrayToList = List.of

// listToArray :: List a -> [a]
const listToArray = curry(xs => xs.$value[0])

// split :: String -> String -> [String]
const split = curry((sep, str) => str.split(sep))

// intercalate :: String -> [String] -> String
const intercalate = curry((str, xs) => xs.join(str))

const id = x => x
const strToList = split('')
const listToStr = intercalate('')

const doListyThings = compose(map(id), arrayToList)
const doListyThings_ = compose(listToArray, arrayToList)

console.log(
  compose(doListyThings, strToList)('123'),
  compose(listToStr, doListyThings_, strToList)('123')
)
