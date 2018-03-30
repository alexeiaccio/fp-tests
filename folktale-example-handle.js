import Maybe from 'folktale/maybe'
import Result from 'folktale/result'
import { union, derivations } from 'folktale/adt/union'
import { log } from 'core-js';

const find = (list, predicate) => {
  for (var i = 0; i < list.length; ++i) {
    const item = list[i]
    if (predicate(item)) {
      return Maybe.Just(item)
    }
  }
  return Maybe.Nothing()
}

console.log(
  find([1, 2, 3], (x) => x > 2),
  find([1, 2, 3], (x) => x > 3),
  find([null], x => true)
)

function get(object, key) {
  return key in object ?  Maybe.Just(object[key])
  :      /* otherwise */  Maybe.Nothing()
}

const config = {
  host: '0.0.0.0'
}
const host = get(config, 'host').getOrElse('localhost')
const port = get(config, 'port').getOrElse(8080)

console.log(`${host}:${port}`)

function first(list) {
  return list.length > 0 ?  Maybe.Just(list[0])
  :      /* otherwise */    Maybe.Nothing()
}
function second(list) {
  return list.length > 1 ?  Maybe.Just(list[1])
  :      /* otherwise */    Maybe.Nothing()
}

function render(item) {
  return ['item', ['title', item.title]]
}

console.log(
  first([{ title: 'Hello' }]).map(render).getOrElse('Nothing'),
  first([{ title: 'Hello' }]).map(render).map(second).getOrElse('Nothing'),
  first([{ title: 'Hello' }]).map(render).chain(second).getOrElse('Nothing'),
  first([]).map(render).chain(second).getOrElse('Nothing')
)


let nextId = 1

function issueError() {
  return Maybe.Just(`Error #${nextId++}`)
}

console.log(
  first([1]).orElse(issueError),
  first([]).orElse(issueError)
)

console.log(
  first([1]).matchWith({
    Just: ({ value }) => `Found: ${value}`,
    Nothing: () => 'Nothing was found'
  }),  
  first([]).matchWith({
    Just: ({ value }) => `Found: ${value}`,
    Nothing: () => 'Nothing was found'
  })
)

console.log(
  Maybe.hasInstance(first([1])),
  Maybe.hasInstance([1]),
)

console.log(
  Maybe.of(1),
  Maybe.empty(),
  Maybe.fromNullable(1),
  Maybe.fromNullable(null),
  Maybe.fromNullable(undefined)
)

console.log(
  Maybe.fromJSON(Maybe.Just([1]).toJSON()),
  Maybe.fromJSON(Maybe.Nothing().toJSON())
)

const DivisionErrors = union('division-errors', {
  DivisionByZero(dividend) { return {dividend} }
}).derive(
  derivations.equality,
  derivations.debugRepresentation
)
const { DivisionByZero } = DivisionErrors
const divideBy = (dividend, divisor) => 
  divisor === 0 ?  Result.Error(DivisionByZero(dividend))
: /* otherwise */  Result.Ok(Math.floor(dividend / divisor))

console.log(
  divideBy(4, 2),
  divideBy(4, 0)
)

const isValidName = x => x
const isValidEmail = x => x
const isValidPhone = x => x
const check = x => x
const InvalidEmail = x => Maybe.of(x)
const InvalidPhone = x => Maybe.of(x)

const checkName = (name) =>
  isValidName(name) ?  Result.Ok(name)
: /* otherwise */      Result.Error(Required('name'))
const checkEmail = (email) =>
  isValidEmail(email) ?  Result.Ok(email)
: /* otherwise */        Result.Error(InvalidEmail(email))
const checkPhone = (phone) =>
  isValidPhone(phone) ?  Result.Ok(phone)
: /* otherwise */        Result.Error(InvalidPhone(phone))

const optional = (check) => (value) =>
  value           ?  check(value).mapError(Optional)
: /* otherwise */    Result.Ok(value)

const maybeCheckEmail = optional(checkEmail)
const maybeCheckPhone = optional(checkPhone)

const validateResult = ({ name, type, email, phone }) =>
  checkName(name).chain(_ => 
    type === 'email' ?  checkEmail(email).chain(_ =>
                          maybeCheckPhone(phone).map(_ => ({
                            name, type, email, phone
                          }))
                        )
  : type === 'phone' ?  checkPhone(phone).chain(_ =>
                          maybeCheckEmail(email).map(_ => ({
                            name, type, email, phone
                          }))
                        )
  : /* otherwise */     Result.Error(InvalidType(type))
  )

  console.log(
    validateResult({
      name: 'Max',
      type: 'email',
      phone: '11234456'
    }),
    validateResult({
      name: 'Alissa',
      type: 'email',
      email: 'alissa@somedomain'
    })
  )
  
  //: (Number, Number) => Result DivisionByZero Number
const divideBy2 = (dividend, divisor) => {
  if (divisor === 0) {
    return Result.Error('Division by zero')
  } else {
    return Result.Ok(dividend / divisor)
  }
}

console.log(
  divideBy2(6, 3),
  divideBy2(6, 0)
)

const isDigit = (character) =>
  '0123456789'.split('').includes(character)
const digit = (input) => {
  const character = input.slice(0, 1)
  const rest = input.slice(1)
  return isDigit(character) ?  Result.Ok([character, rest])
  :      /* otherwise */       Result.Error(`Expected a digit (0..9), got "${character}"`)
}

console.log(
  digit('012'),
  digit('a12')
)

const digits = (input) =>
  input === '' ?   Result.Error('Expected a digit (0..9), but there was nothing to parse')
: /* otherwise */  digit(input).chain(([character, rest]) =>
                     rest === '' ?  Result.Ok(character)
                   : /* else */     digits(rest).chain(characters =>
                                      Result.Ok(character + characters)
                                    )
                   )

console.log(
  digits('012'),
  digits('a12'),
  digits('12a'),
  digits('')
)

const integer = (input) =>
  digits(input).chain(x => Result.Ok(Number(x)))
const integerMap = (input) =>
  digits(input).map(Number)

console.log(
  integer('012'),
  integerMap('012'),
  integer('01a')
)

console.log(
  Result.Ok(1).getOrElse('not found'),
  Result.Ok(1).merge(),
  Result.Error(1).merge(),
  Result.Error(1).getOrElse('not found')
)

const parseNumber = (input) =>
  isNaN(input) ?   Result.Error(`Not a number: ${input}`) 
: /* otherwise */  Result.Ok(Number(input));

const parseBool = (input) =>
  input === 'true'  ?  Result.Ok(true)
: input === 'false' ?  Result.Ok(false)
: /* otherwise */      Result.Error(`Not a boolean: ${input}`);

const parseNumberOrBool = (input) =>
  parseNumber(input)
    .orElse(_ => parseBool(input));

console.log(
  parseNumberOrBool('13'),
  parseNumberOrBool('true'),
  parseNumberOrBool('foo')
)

const parseNumberOrBool2 = (input) =>
  parseNumber(input)
    .orElse(_ => parseBool(input))
    .mapError(_ => `Not a number or boolean: ${input}`);

console.log(
  parseNumberOrBool2('foo')
)

console.log(
  Result.Ok(1).matchWith({
    Ok:    ({ value }) => `Ok: ${value}`,
    Error: ({ value }) => `Error: ${value}`
  }),
  Result.Error(1).matchWith({
    Ok:    ({ value }) => `Ok: ${value}`,
    Error: ({ value }) => `Error: ${value}`
  })
)

console.log(
  Result.hasInstance(Result.Ok(1)),
  Result.hasInstance({a:1}),
  Result.of(1)
)
console.log(
  Result.fromMaybe(Maybe.Just(1), 'error'),
  Result.fromMaybe(Maybe.Nothing(), 'error')
)
console.log(
  Result.fromNullable(1, 'error'),
  Result.fromNullable(null, 'error'),
  Result.fromNullable(undefined, 'error')
)

const Validation = require('folktale/validation')

console.log(
  Result.fromValidation(Validation.Success(1)),
  Result.fromValidation(Validation.Failure(1))
)

function successor(natural) {
  if (natural < 0) {
    throw `Not a natural number: ${natural}`;
  } else {
    return natural + 1;
  }
}

console.log(
  Result.try(() => successor(-1)),
  Result.try(() => successor(1))
)

console.log(Result.fromJSON(Result.Ok(1).toJSON()))


