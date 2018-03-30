import Task, { task, of, waitAny, waitAll, rejected, fromPromised } from 'folktale/concurrency/task'
import { fromPromise } from 'folktale/concurrency/future'
import { of as futureOf, rejected as futureRejected } from 'folktale/concurrency/future'

const one = task(resolver => resolver.resolve(1))

one.run().future().map(value => {
  console.log('value', value)
})

futureOf(1).map(x => {
  console.log('of', x)
})

futureRejected(1).mapRejected(x => {
  console.log('rejected', x)  
})

console.log(
  fromPromise(Promise.resolve(1)).inspect(),
  fromPromise(Promise.reject(1)).toString()
)

fromPromise(Promise.reject(1)).mapRejected(x => {
  console.log('fromPromiseRejected', x)  
})

const delay = (ms) => task(
  (resolver) => {
    const timerId = setTimeout(() => resolver.resolve(ms), ms)
    resolver.cleanup(() => {
      clearTimeout(timerId)
    })
    resolver.onCancelled(() => {
      /* does nothing */
    })
  }
)

const result = delay(100).or(delay(2000)).run().future().map(x => {
  console.log('result', x)
})

const resultAwait = delay(200).run().promise()
.then(x => console.log('resultAwait', x))

const resultwaitAny = waitAny([
  delay(10),
  delay(20),
  delay(30)
]).run().promise()
.then(x => console.log('resultwaitAny', x))

const hello = task(resolver => {
  const timerId = setTimeout(() => {
    resolved = true
    resolver.resolve('hello')
  }, 50)

  resolver.cleanup(() => {
    clearTimeout(timerId)
  })
})
const helloExecution = hello.run()
helloExecution.cancel()
helloExecution.listen({
  onCancelled: () => console.log('helloExecution was cancelled'),
  onRejected:  (reason) => console.log('helloExecution was rejected'),
  onResolved:  (value) => console.log('helloExecution', value)
})

const concat = (a, b) => task(resolver => resolver.resolve(a + b))

const taskA = of('hello')
const taskB = of('world')

const theTask = taskA.chain(x => taskB.chain(y => concat(x, y)))

const seqensedResult = theTask.run().promise()
.then(x => console.log('seqensedResult', x))

const independentResult = delay(60).chain(x => delay(40).map(y => [x, y])).run().promise()
.then(x => console.log('seqensedResult', x))

const independentResult2 = delay(60).and(delay(40)).run().promise()
.then(x => console.log('independentResult', x))

const resultwaitAll = waitAll([
  delay(10),
  delay(20),
  delay(30)
]).run().promise()
.then(x => console.log('waitAll', x))

let errors = []

const erroredResult = rejected('nope').orElse(reason => {
  errors.push(reason)
  return of('yay')
}).run().promise()
.then(x => console.log(
  'erroredResult', x,
  'error', errors
))

let retryErrors = []

const retry = (task, times) => {
  return task.orElse(reason => {
    retryErrors.push(reason)
    if (times > 1) {
      return retry(task, times - 1)
    } else {
      return rejected('I give up')
    }
  })
}

let runs = 0
const ohNoes = task(r => {
  runs += 1
  r.reject('fail')
})

const retryResult = retry(ohNoes, 3).run().promise()
.then(x => console.log(
  'retryResult', x
))
.catch(error => console.log(runs, error, 'error', retryErrors))

const fn = (str, str2, cb) => cb(null, str + str2 + 'processed')
const convertedFn = Task.fromNodeback(fn)
const convertedTask = convertedFn('test', '-was-')
const convertedTaskResult = convertedTask.run().promise()
.then(x => console.log(
  'convertedTaskResult', x
))

function promiseDelay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms)
  })
}

const delayTask = fromPromised(promiseDelay)

delayTask(10).run().promise()
.then(x => console.log(
  'delayTaskResult', x
))

const resultTask = task.do(function* () {
  const a = yield task.of(1)
  const b = yield task.of(2)  
  return task.of((a + b) * (yield task.of(3)))
})

const resultTaskResult = resultTask.run().promise()
.then(x => console.log(
  'resultTaskResult', x
))
