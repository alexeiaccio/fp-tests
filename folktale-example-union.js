import union from 'folktale/adt/union/union'
import Equality from 'folktale/adt/union/derivations/equality'
import debugRepresentation from 'folktale/adt/union/derivations/debug-representation'
import Serialization from 'folktale/adt/union/derivations/serialization'

const Maybe = union('Maybe', {
  Some(value) { return {value} },
  None() { return {} }
})

console.log(
  Maybe.Some(1).matchWith({
    Some: ({value}) => `Found ${value}`,
    None: () => 'Not found'
  })
)

Maybe.derive(Equality)

console.log(
  Maybe.Some(1).equals(Maybe.Some(1)),
  Maybe.Some(2).equals(Maybe.Some(1)),
  Maybe.hasInstance(Maybe.None()),
  Maybe.Some.hasInstance(Maybe.None()),
  Maybe.None.hasInstance(Maybe.None()),
  Maybe.Some.hasInstance(Maybe.Some(1))
)

const List = union('List', {
  Nil(){},
  Cons(value, rest) {
    return { value, rest }
  }
})

const { Nil, Cons } = List

console.log(
  Cons('a', Cons('b', Cons('c', Nil())))
)

List.sum = function() {
  return this.matchWith({
    Nil: () => 0,
    Cons: ({value, rest}) => value + rest.sum()
  })
}

console.log(
  'Sum', Cons(1, Cons(2, Nil())).sum()
)

function ToJSON(variant, union) {
  var { tag, type } = variant
  variant.prototype.toJSON = function() {
    var json = { tag: `${type}:${tag}` }
    Object.keys(this).forEach(key => {
      var value = this[key]
      if (value && typeof value.toJSON === "function") {
        json[key] = value.toJSON()
      } else {
        json[key] = value
      }
    })
    return json
  }
}

List.derive(ToJSON)

console.log(
  Nil().toJSON(),
  Cons(1, Nil()).toJSON()
)

/* const hash = Symbol('hash code')

const List = union('List', {
  Nil(){ return { [hash]: 0 } },
  Cons(value, rest) {
    return {
      [hash]: value + rest[hash],
      value, rest
    }
  }
}) */

/* Nil.prototype.equals = function(that) {
  return Nil.hasInstance(that);
}

Cons.prototype.equals = function(that) {
  if (this === that)              return true
  if (!Cons.hasInstance(that))    return false
  if (this[hash] !== that[hash])  return false

  return this.value === that.value
  &&     this.rest.equals(that.rest)
}

const Lista = Cons(1, Cons(2, Cons(3, Nil())))
const Listb = Cons(1, Cons(2, Cons(3, Nil())))
const Listc = Cons(1, b)

console.log(
  a.equals(b),
  a.equals(c)
) */

const Result = union('Result', {
  Ok(value) {
    return { value } 
  },
  Error(reason) {
    return { reason }
  }
})

const { Ok, Error } = Result

console.log(
  Ok(1)[union.typeSymbol],
  Error(1)[union.typeSymbol],
  Ok(1)[union.tagSymbol],
  Error(1)[union.tagSymbol],
  Object.keys(Ok(1)),
  Object.keys(Error(1))
)

const { Error: E } = union('Res', {
  Error(value){ return { value } }
}).derive(Equality)

/* console.log(
  E(1).equals(Error(1)) // ==> false  // same tag, keys, and values. Different types ('Result' !== 'Res')
) */

/* const APIError = union('APIError', {
  NetworkError(error){
    return { error }
  },
  ServiceError(code, message) {
    return { code, message }
  },
  ParsingError(error, data) {
    return { error, data }
  }
}) */

/* function handleError(error) {
  error.matchWith({
    NetworkError: ({ error }) => { ... },
    ServiceError: ({ code, message }) => { ... },
    ParsingError: ({ error, data }) => { ... }
  })
}

api.method(response => {
  response.matchWith({
    Error: ({ reason }) => handleError(reason),
    Ok:    ({ value })  => { ... }
  })
}) */

const Either = union('Either', {
  Left(value) { return { value } },
  Right(value) { return { value } }
}).derive(Equality)

console.log(
  Either.Left(1).equals(Either.Left(1)),
  Either.Left(1).equals(Either.Right(1)),
  Either.Right(2).equals(Either.Right(2))
)

const Id = union('Identity', { Id(value){ return { value } } }).derive(Equality, Serialization)

const json = Id.Id(1).toJSON()

console.log(
  Id[Symbol.for('@@folktale:adt:type')],
  Id[union.typeSymbol],
  Id[union.tagSymbol],
  Id.Id(1).toJSON(),
  JSON.stringify(Id.Id(1)),
  Id.fromJSON(json)
)

const IdA = union('IdA', { Id: (x) => ({ x }) })
const IdB = union('IdB', { Id: (x) => ({ x }) })

console.log(
  IdA.hasInstance(IdA.Id(1)),
  IdA.hasInstance(IdB.Id(1))
)

const { Id: Id2 } = union('Id', { Id(value) { return value } }).derive(debugRepresentation)

Object.prototype.toString.call(Id2(1))
const a = Id.Id(1)
const b = Id.Id(1)

console.log(
  Id2(1).toString(),
  Id2(1).inspect()
)

console.log(
  a === a,
  b === b,
  a === b
)

console.log(
  a.equals(b),
  a.equals(a),
  a.equals(Id.Id(2))
)

const isEqual = (a, b) =>
  Array.isArray(a) && Array.isArray(b) ?  arrayEquals(a, b)
: a == null                            ?  a === b
: a['fantasy-land/equals']             ?  a['fantasy-land/equals'](b)
: a.equals                             ?  a.equals(b)
:                                         a === b

const arrayEquals = (a, b) =>
   Array.isArray(a) && Array.isArray(b)
&& a.length === b.length
&& a.every((x, i) => isEqual(x, b[i]))

const { Id: Id3 } = union('Id', { Id(value) { return value } }).derive(Equality.withCustomComparison(isEqual))

console.log(
  Id3([1]).equals(Id3([1])),
  Id3(Id3(1)).equals(Id3(Id3(1))),
  Id3(2).equals(Id3(1))
)


const { Left, Right} = Either

console.log(
  Left.hasInstance(Left(1)),
  Left.hasInstance(Right(1))
)

