/* const task = require('folktale/concurrency/task')

const resultTask = task.do(function* () {
  const a = yield task.of(1)
  const b = yield task.of(2)

  return task.of((a + b) * (yield task.of(3)))
})

const value = resultTask.run().promise()
.then(value => {
  console.log(value)
}) */


import union from 'folktale/adt/union/union'
import Equality from 'folktale/adt/union/derivations/equality'

/*~ type: (Number, Number) => Number */
const Id = union('Id', { id(value) { return { value } } })

const CheckType = union('CheckType', {
  Left(value) { return `This ${value} is not right type.` },
  Right(value) { return { value } }
}).derive(Equality)

Id.sum = (a, b) => console.log(
  typeof a,
  typeof b
)

const prop = (key, object) => object[key]

console.log(
  Id[Symbol.for('@@folktale:adt:type')],
  prop('type', Id[Symbol.for('@@meta:magical')]),
  Id.id(1),
  Id.sum(1, 2),
  Id.sum(1, "2")
)
