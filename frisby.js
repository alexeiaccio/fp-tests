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


const Right = x =>
({
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `Right(f(${x}))`,
})

const Left = x =>
({
  chain: f => Left(x),
  map: f => Left(x),
  fold: (f, g) => f(x),
  inspect: () => `Left(${x})`,
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

const tryCatch = f => {
  try {
    return Right(f())
  } catch(e) {
    return Left(e)
  }
}

const fs =require('browserify-fs')

const getPort = () =>
  tryCatch(() => fs.readFile('./frisby.json', 'utf-8', (cb) => console.log(cb)))
  //.chain(c => tryCatch(() => JSON.parse(c)))

console.log(
  getPort().inspect()
)
