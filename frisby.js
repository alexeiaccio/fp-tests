// Box — Functor  — has map

const Box = x =>
({
  map: f => Box(f(x)),
  fold: f => f(x),
  inspect: f => `Box(f(${x}))`,
})

const nextCharForNumberString = str =>
  Box(str)
  .map(s => s.trim())
  .map(r => parseInt(r))
  .map(i => i + 1)
  .map(i => String.fromCharCode(i))


const res = nextCharForNumberString(' 64 ')

console.log(
  res.inspect(),
  res.fold(c => c.toLowerCase())
)

const toFloat = reg => str =>
  Box(str.replace(reg, ''))
  .map(parseFloat)

const moneyToFloat =
  toFloat(/\$/g)

const percentToFloat = str =>
  toFloat(/\%/g)(str)
  .map(number => number * 0.01)

const applyDiscount = (price, discount) =>
  moneyToFloat(price)
  .fold(cost =>
    percentToFloat(discount)
    .fold(saving =>
      cost - cost * saving))

const res2 = applyDiscount('$10.25', '15%')

console.log(
  res2,
)

// Chain  — has chain
const Right = x =>
({
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (f, g) => g(x),
  concat: o =>
    o.fold(_ => Left(x),
           r => Right(x.concat(r))),
  inspect: () => `Right(f(${x}))`,
  isRight: true,
  isLeft: false
})

const Left = x =>
({
  chain: f => Left(x),
  map: f => Left(x),
  fold: (f, g) => f(x),
  concat: _ => Left(x),
  inspect: () => `Left(${x})`,
  isRight: false,
  isLeft: true
})

const fromNullable = x =>
  x != null ? Right(x) : Left(null)

const findColor = name =>
  fromNullable({red: '#ff4444', blue: '#3b5998', yellow: '#fff68f'}[name])

const res3 = name =>
  findColor(name)
  .map(c => c.slice(1))
  .fold(e => 'no color',
        c => c.toUpperCase())

console.log(
  res3('blue'),
  res3('blues'),
  res3('red'),
  res3('green'),
)

const concatUniq = (x, ys) =>
  fromNullable(ys.filter(y => y === x)[0])
  .fold(() => ys.concat(x), y => ys)

console.log(
  concatUniq('c', ['a', 'a', 'b', 'b', 'x']),
  concatUniq('a', ['a', 'a', 'b', 'b', 'x']),
  concatUniq('v', ['a', 'a', 'b', 'b', 'x']),
)

// Semigroup — has concat
const Sum = x =>
({
  x,
  concat: ({x: y}) => Sum(x + y),
  inspect: () => `Sum(${x})`
})

const All = x =>
({
  x,
  concat: ({x: y}) => All(x && y),
  inspect: () => `All(${x})`
})

/* const First = x =>
({
  x,
  concat: _ => First(x),
  inspect: () => `First(${x})`
}) */ // it's not Monoid

const First = either =>
({
  fold: f => f(either),
  concat: o => either.isLeft ? o : First(either),
  inspect: () => `First(${either})`
})

First.empty = () => First(Left())

console.log(
  Sum(1).concat(Sum(2)).inspect(),
  All(true).concat(All(true)).inspect(),
  All(true).concat(All(false)).inspect(),
  First('true').concat(First('false')).inspect(),
)


import { Map, List } from "immutable-ext"

const acct1 = Map({ name: First('Nico'), isPaid: All(true), points: Sum(10), friends: ['Franklin'] })
const acct2 = Map({ name: First('Nico'), isPaid: All(false), points: Sum(2), friends: ['Gatsby'] })

console.log(
  acct1.concat(acct2).toJS()
)

// Monoid — Semigroup with Identity, reduce
Sum.empty = () => Sum(0)
const sum = xs =>
  xs.reduce((acc, x) => acc + x, 0)

All.empty = () => All(true)
const all = xs =>
  xs.reduce((acc, x) => acc && x, true)

//First.empty = () => First(?)
//const first = xs =>
//  xs.reduce((acc, x) => acc) // not have Empty

console.log(
  Sum(1).concat(Sum(2)).concat(Sum.empty()).inspect(),
  All(true).concat(All(false)).concat(All.empty()).inspect(),
  sum([1, 2]),
  sum([]),
  all([true, false]),
  all([]),
  //first(['a', 'b']),
  //first([]),
)

const Product = x =>
({
  x,
  concat: ({x: y}) => Product(x * y),
  empty: () => Product(1),
  inspect: () => `Product(${x})`
})

const Any = x =>
({
  x,
  concat: ({x: y}) => Any(x || y),
  empty: () => Any(false),
  inspect: () => `Any(${x})`
})

const Max = x =>
({
  x,
  concat: ({x: y}) => Max(x > y ? x : y),
  empty: () => Max(-Infinity),
  inspect: () => `Max(${x})`
})

const Min = x =>
({
  x,
  concat: ({x: y}) => Min(x < y ? x : y),
  empty: () => Min(Infinity),
  inspect: () => `Min(${x})`
})

const stats1 = List.of({page: 'Home', views: 40}, {page: 'About', views: 10}, {page: 'Blog', views: 4})
const stats2 = List.of({page: 'Home', views: 40}, {page: 'About', views: 10}, {page: 'Blog', views: null})

console.log(
  stats1.foldMap(x => fromNullable(x.views).map(Sum), Right(Sum(0))).chain(x => x).inspect(),
  stats2.foldMap(x => fromNullable(x.views).map(Sum), Right(Sum.empty())).inspect(),
)

const find = (xs, f) =>
  List(xs)
  .foldMap(x =>
    First(f(x) ? Right(x) : Left(), First.empty()))
  .fold(x => x)

console.log(
  find([3, 4, 5, 6, 7], x => x > 4).inspect(),
  find([3, 4], x => x > 4).inspect(),
)

const Fn = f =>
({
  fold: f,
  concat: o =>
    Fn(x => f(x).concat(o.fold(x)))
})

import compose from 'crocks/helpers/compose'

const hasVowels = x => !!x.match(/[aeiou]/ig)
const longWord = x => x.length >= 5
const both = Fn(compose(Any, hasVowels)) // All || Any
             .concat(Fn(compose(Any, longWord))) // All || Any

console.log(
  ['gym', 'bird', 'lilac']
  .filter(x => both.fold(x).x)
)

const Pair = (x, y) =>
({
  x,
  y,
  concat: ({x: x1, y: y1}) =>
    Pair(x.concat(x1), y.concat(y1))
})

console.log(
  Pair([1], [2]).concat(Pair([2], [3]))
)

// folMap
const res4 = List.of(1,2,3).foldMap(Sum, Sum.empty()) // === [Sum(1), Sum(2), Sum(3)].fold(Sum.empty()) === .reduce((acc,x)=>acc.concat(x), Sum.empty())
const res5 = Map({sara: 4, nick: 5}).foldMap(Sum, Sum.empty()) // === Map({sara: Sum(4), nick: Sum(5)}).fold(Sum.empty())

console.log(
  res4.inspect(),
  res5.inspect(),
)

const LazyBox = g =>
({
  fold: f => f(g()),
  map: f => LazyBox(() => f(g())) // Promise like
})

const res6 =
  LazyBox(() => ' 64 ') // Box(' 64 ')
  .map(abba => abba.trim())
  .map(t => new Number(t))
  .map(n => n +1)
  .map(x => String.fromCharCode(x))
  .fold(x => x.toLowerCase())

console.log(
  res6
)

import {task} from 'folktale/concurrency/task'

const lunch = () =>
  task((resolver) => {
    console.log('Lunch missiles!')
    resolver.resolve('missile')
    //resolver.reject('missile')
  })

const app = lunch().map(x => x + '!')

app
.map(x => x + '!')
.run().future()
.map(x => console.log(x))
.mapRejected(e => console.log(e))
