import Task, { task } from 'folktale/concurrency/task'
import Either from './Either-Frisby'
const { Right, Left, fromNullable, of } = Either
import { List, Map } from 'immutable-ext'

const Box = x =>
({
  ap: b2 => b2.map(x),
  map: f => Box(f(x)),
  fold: f => f(x),
  chain: f => f(x),
  inspect: f => `Box(${x})`,
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

console.log(
  Box(x => x + 1)
  .ap(Box(2))
  .inspect()
)

const add = x => y => x + y

console.log(
  Box(add)
  .ap(Box(2))
  .ap(Box(3))
  .inspect()
)

// F(f).ap(F).ap(y) === F.map(f).ap(y)
const liftA2 = (f, fx, fy) =>
  fx.map(f).ap(fy)

console.log(
  liftA2(add, Box(2), Box(4)).inspect(), // https://github.com/hemanth/functional-programming-jargon#lift
)

const $ = selector => Either.of({selector, height: 10})
const getScreenSize = screen => head => foot =>
  screen - (head.height + foot.height)

console.log(
  Either.of(getScreenSize(800))
  .ap($('header'))
  .ap($('footer'))
  .inspect(),
  liftA2(getScreenSize(800), $('header'), $('footer'))
  .inspect()
)

console.log(
  List.of(x => y => z => `${x}-${y}-${z}`)
  .ap(List(['t-shirt', 'sweater']))
  .ap(List(['l', 'xl']))
  .ap(List(['black', 'white']))
  .inspect()
)

const Db = ({
 find: id =>
  task(relover =>
    setTimeout(() =>
      relover.resolve({id, title: `Project ${id}`}), 100))
      //relover.reject(`Project ${id} not find`), 100))
})

const reportHeader = (p1, p2) =>
  `Report: ${p1.title} compared to ${p2.title}`

const compare = Task.of(p1 => p2 => reportHeader(p1, p2))
.ap(Db.find(20))
.ap(Db.find(8))

compare
.run().future()
.map(x => console.log(x))
.mapRejected(x => console.log(x))

const httpGet = (path, params) =>
  Task.of(`${path} result`)

Map({home: '/Home', about: '/About', blog: '/Blog'})
.traverse(Task.of, root => httpGet(root, {}))
.run().future()
.map(r => console.log(r.inspect()))

Map({home: ['/', '/home'], about: ['/about']})
.traverse(Task.of, rootes =>
  List(rootes)
  .traverse(Task.of, root => httpGet(root, {})))
.run().future()
.map(r => console.log(r.inspect()))

// nt(x).map(f) === nt(x.map(f)) – NAtural Transformation

const first = xs =>
  fromNullable(xs[0])

console.log(
  first([1,2,3]).map(x => x + 1).inspect(),
  first([1,2,3].map(x => x + 1)).inspect(),
  first([].map(x => x + 1)).inspect(),
)

const boxToEither = b =>
  b.fold(fromNullable)

console.log(
  boxToEither(Box(100)).inspect(),
  boxToEither(Box()).inspect(),
)

console.log(
  List(['hello', 'world'])
  .chain(x => List(x.split('')))
  .inspect()
)

const largerNumbers = xs =>
  xs.filter(x => x > 100)

const larger = x => x * 2

console.log(
  first(largerNumbers([2,400,5,1000]))
  .map(larger)
  .inspect()
)

const fake = id =>
  ({id, name: 'user1', best_friend_id: id + 1})

const Db2 = ({
  find: id =>
    task(resolver =>
      resolver.resolve(id > 2 ? Right(fake(id)) : Left('not found')))
})

const eitherToTask = e =>
  e.fold(Task.rejected, Task.of)

Db2.find(3)
.chain(eitherToTask)
.chain(user => Db2.find(user.best_friend_id))
.chain(eitherToTask)
.run().future()
.map(console.log)
.mapRejected(console.log)

// Isomorphism
// from(to(x)) === x

const Iso = (to, from) =>
({
  to,
  from
})

const chars = Iso(s => s.split(''), c => c.join(''))

const truncate = str =>
  chars.from(chars.to(str).slice(0, 3).concat('...'))

console.log(
  chars.to('hello world'),
  chars.from(chars.to('hello world')),
  truncate('hello world'),
)

// [a] ~ Either null a
const singleton = Iso(e => e.fold(() => [], x => [x]),
                     ([x]) => x ? Right(x) : Left())

const filterEither = (e, pred) =>
  singleton.from(singleton.to(e).filter(pred))

console.log(
  filterEither(Right('hello'), x => x.match(/h/ig))
  .map(x => x.toUpperCase())
  .inspect(),
  filterEither(Right('ello'), x => x.match(/h/ig))
  .map(x => x.toUpperCase())
  .inspect()
)
