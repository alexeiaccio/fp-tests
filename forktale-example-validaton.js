import Validation, { Success, Failure, collect } from 'folktale/validation'

const notEmpty = (field, value) =>
  value.trim() ?   Success(value)
: /* else */       Failure([`${field} can't be empty`])

const minLength = (field, min, value) =>
  value.length > min ?   Success(value)
: /* otherwise */        Failure([`${field} must have at least ${min} characters`])

const matches = (field, regexp, value, message = '') =>
  regexp.test(value) ?  Success(value)
: /* otherwise */       Failure([message || `${field} must match ${regexp}`])

const isPasswordValid = (password) =>
  Success().concat(minLength('password', 6, password))
           .concat(matches('password', /\W/, password, 'password must contain a special character'))
           .map(_ => password)

const isNameValid = (name) =>
  Success().concat(minLength('name', 2, name))
           .concat(notEmpty('name', name))
           .map(_ => name)

const validateForm = (data) =>
  Success().concat(isPasswordValid(data.password))
           .concat(isNameValid(data.name))
           .map(_ => data)

console.log(
  validateForm({
    name: '',
    password: 'roses$are$red'
  }),
  validateForm({
    name: 'Alissa',
    password: 'rosesa$rered'
  }),
  validateForm({
    name: 'A',
    password: 'alis'
  })
)

console.log(
  Failure('a').concat(Failure('b')),
  Failure('a').concat(Success('b')),
  Success('a').concat(Success('b'))
)

import curry from 'folktale/core/lambda/curry'
const Language = curry(2, (name, compiler) => ({ name, compiler }))

console.log(
  Success(Language)
  .apply(Success('Rust'))
  .apply(Success('rustc'))
)

console.log(
  collect([Failure('a'), Failure('b'), Success('c')])
)

console.log(
  Success(1).map(x => x + 1),
  Failure('a').map(x => x + 1),
  Success(1).concat(Success(2)).map(_ => 'hello')
)

console.log(
  Failure('a').mapFailure(x => x.toUpperCase()),
  Success('a').mapFailure(x => x.toUpperCase())
)

console.log(
  Success(1).matchWith({
    Success: ({ value }) => `Success: ${value}`,
    Failure: ({ value }) => `Failure: ${value}`
  }),
  Failure(1).matchWith({
    Success: ({ value }) => `Success: ${value}`,
    Failure: ({ value }) => `Failure: ${value}`
  })
)

console.log(
  Validation.hasInstance({ value: 1 }),
  Validation.hasInstance(Validation.Success(1)),
  Validation.of(1)
)

import Maybe from 'folktale/maybe'

console.log(
  Validation.fromMaybe(Maybe.Just(1), 'error'),
  Validation.fromMaybe(Maybe.Nothing(), 'error')
)

console.log(
  Validation.fromNullable(1, 'error'),
  Validation.fromNullable(null, 'error'),
  Validation.fromNullable(undefined, 'error')
)

import Result from 'folktale/result'

console.log(
  Validation.fromResult(Result.Ok(1)),
  Validation.fromResult(Result.Error('error'))
)

console.log(Validation.fromJSON(Validation.Success(1).toJSON()))

