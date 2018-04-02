const fs =require('fs')

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

const tryCatch = f => {
  try {
    return Right(f())
  } catch(e) {
    return Left(e)
  }
}

const fromNullable = x =>
  x != null ? Right(x) : Left(null)

const getPort = file =>
  tryCatch(() => fs.readFileSync(`./${file}.json`))
  .chain(c => tryCatch(() => JSON.parse(c)))
  .fold(e => 3000,
        c => c.port)

console.log(
  getPort('frisby'),
  getPort('frisby-fail'),
  getPort('frisb'),
)
