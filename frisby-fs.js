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

const readFile = x => tryCatch(() => fs.readFileSync(x, 'utf-8'))

const wrapExample = example =>
  fromNullable(example.path)
  .chain(readFile)
  .map(JSON.parse)
  .fold(() => example,
        preview => Object.assign({}, example, { preview }))

console.log(
  wrapExample({ path: './frisby.json'}),
  wrapExample({ path: null}),
)

const Task = require('folktale/concurrency/task')
const { task } = Task

const readFile2 = (filename, enc) =>
  task((resolver) =>
    fs.readFile(filename, enc, (err, success) =>
      err ? resolver.reject(err)
      :     resolver.resolve(success)))

const writeFile2 = (filename, contents) =>
  task((resolver) =>
    fs.writeFile(filename, contents, (err, success) =>
    err ? resolver.reject(err)
    :     resolver.resolve(success)))

const app =
  readFile2('frisby.json', 'utf-8')
  .map(c => c.replace(/8/g, '6'))
  .chain(c => writeFile2('frisby2.json', c))

app
.run().future()
.map(x => console.log('Success'))
.mapRejected(e => console.log('Error', e))
