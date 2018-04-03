import Task, { task } from 'folktale/concurrency/task'
import Either from './Either-Frisby'
const { Right, Left, fromNullable, of } = Either
import { List, Map } from 'immutable-ext'

const Box = x =>
({
  map: f => Box(f(x)),
  fold: f => f(x),
  chain: f => f(x),
  inspect: f => `Box(f(${x}))`,
})

Box.of = Box

// fx.map(f).map(g) === fx.map(x => g(f(x))) Composition

const res1 =
  Box('squirrels')
  .map(s => s.slice(5))
  .map(s => s.toUpperCase())

const res2 =
  Box('squirrels')
  .map(s => s.slice(5).toUpperCase())

console.log(
  res1.inspect(),
  res2.inspect()
)

// fx.map(id) === id(fx) Identity

const id = x => x

const res3 = Box('crayons').map(id)
const res4 = id(Box('crayons'))

console.log(
  res3.inspect(),
  res4.inspect()
)

console.log(
  Task.of('hello'),
  Either.of('hello').map(x => x + '!').inspect(),
  Box.of(100).inspect()
)

// Monad – Box, Either, Task, List – F.of, chain (flatMap, bind, >>=)

const join = m =>
  m.chain(id)

const m = Box(Box(Box(3)))
const m1 = Box('Wonder')
const res5 = join(m.map(join)) // join(Box.of(m)) === join(m.map(Box.of))
const res6 = join(join(m))
const res7 = join(Box.of(m1))
const res8 = join(m1.map(Box.of))

console.log(
  res5.inspect(),
  res6.inspect(),
  res7.inspect(),
  res8.inspect(),
)
