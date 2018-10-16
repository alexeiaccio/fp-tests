const getKey = (...args) => args.join('-')

function memoize(fn) {
  let result = {}
  
  return function(...args) {
    let thatKey = getKey(...args)
    if (result[thatKey] !== undefined) {
      return result[thatKey]    
    }
    let firsRes = fn(...args)
    Object.assign(result, { [thatKey]: firsRes })
    return firsRes
  }
}

function mathPow(one, two) {
  console.log(one, two)
  
  return Math.pow(one, two)
}\

const memoizedFunction = memoize(mathPow)

memoizedFunction(10, 3)
memoizedFunction(3, 10)

console.log(memoizedFunction(0, 5))
console.log(memoizedFunction(0, 5))