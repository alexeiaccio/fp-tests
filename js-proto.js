/* https://egghead.io/courses/understanding-javascript-s-prototypal-inheritance */

/* 2 */
const obj = {
  firstName: 'Poop'
}

console.log(obj.firstName) //Poop
console.log(obj.lastName) //undefined

const protoObj = {
  lastName: 'Poopovich'
}

Object.setPrototypeOf(obj, protoObj)

console.log(obj.lastName) //Poopovich

/* 3 */
function Car(make) {
  this.make = make
  this.wheels = 1
}

console.log(Car.prototype) //Car {}

Car.prototype.color = 'brune'
Car.prototype.wheels = 4
console.log(Car.prototype) //Car { color: 'brune', wheels: 4 }​​​​​

const myCar = new Car('Poop')

console.log(myCar) //​​​​​Car { make: 'Poop', wheels: 1 }
console.log(myCar.color) //brune
console.log(myCar.wheels) //1

/* 4 */
function Foo() {
  //..
}

Foo.prototype = {}

Object.defineProperty(Foo.prototype, 'constructor', {
  enumerable: false,
  writable: true,
  value: Foo
})

console.log(Foo.prototype.constructor) //​​​​​[λ: Foo]​​​​​P|
console.log(a.constructor === Foo) //true
console.log(a.constructor === Object) //false

/* 5 */
function Poo(name) {
  this.name = name
}

Poo.prototype.myName = function() {
  return this.name
}

function Bar(name) {
  Poo.call(this, name)
}

Bar.prototype = Object.create(Poo.prototype)

const b = new Bar('Poop')

console.log(b.myName()) //Poop

/* 6 */

const opj = {
  firstName: 'Poop',
  lastName: 'Poopovich'
}

const protoOpj = {
  //color: 'brune'
  lastName: 'brune'
}

Object.setPrototypeOf(opj, protoOpj)

let i = 0
let j = 0

for (let prop in opj) {
  i++
}

console.log(i) //2 or 3 if protoOpf.color

for (let prop in opj) {
  if (opj.hasOwnProperty(prop)) {
    j++
  }
}

console.log(j) //2

/* 7 */
const parent = {
  color: 'brune',
  func() { return this.height * 3 }
}

const shild = Object.create(parent)
shild.height = 8

const sheeld = Object.assign({height: 8}, parent)

console.log(shild.func()) //24

parent.func = () => true

console.log(shild.func()) //true
console.log(sheeld.func()) //24

/* 8 */
class Proop {
  isShit() { return true }
}

class Prup extends Proop {
  canI() { return this.isShit() }
}

const Ploup = new Prup()

console.log(Object.getPrototypeOf(Ploup) === Prup.prototype) //true
console.log(Object.getPrototypeOf(Prup.prototype) === Proop.prototype) //true
console.log(Ploup.canI()) //true
console.log(Prup.prototype.canI()) //true
console.log(Proop.prototype.isShit()) //true

/* 9 */
class Food {
  isShit() { return true }
  static isNoShit() { return true }
  static isAlso() { return this.isNoShit() }
}

console.log(Food.prototype.isShit()) //true
console.log(Food.isNoShit()) //true
console.log(Food.isAlso()) //true

/* 10 */
function Coor(name) {
  this.name = name
}

function Boot(loom) {
  this.loom = loom
}

class Zor {
  constructor(name) {
    this.name = name
  }
}

class Lor {
  constructor(loom) {
    this.loom = loom
  }
}

Object.setPrototypeOf(Boot.prototype, Coor.prototype)
Object.setPrototypeOf(Lor.prototype, Zor.prototype)

const myCoor = new Coor('Poop')
const myBoot = new Boot('Poop')

const myZor = new Zor('Poop')
const myLor = new Lor('Poop')

console.log(myCoor instanceof Coor) //true
console.log(myBoot instanceof Coor) //true

console.log(myZor instanceof Zor) //true
console.log(myLor instanceof Zor) //true

/* 11 */
const createPoop = some => ({ ...some, type: 'shit' }) //Factory Function
//instead const poop = {type: 'shit'} > Object.setPrototypeOf(preap, poop)

const preap = createPoop({ loop: 'never' })
const termy = createPoop({ loop: 'allwais' })

console.log(preap.type) //shit
console.log(termy.type) //shit

/* 12 */
const lama = {
  name: 'lama',
  set rename(mame) {
    this.curMame = mame
  }
}

const amal = {
  eman: 'amal'
}

Object.defineProperty(lama, 'enam', {
  value: 'moom',
  writable: false
})

Object.setPrototypeOf(amal, lama)

console.log(amal.name) //lama

lama.name = 'poop'
lama.enam = 'poop' //Cannot assign to read only property...
amal.mame = 'poop'

console.log(amal.name) //poop
console.log(amal.enam) //moom
console.log(amal.mame) //undefined
console.log(amal) //​​​​​{ eman: 'amal', mame: 'poop' }

/* 13 */ 
function Hey(hop) {
  this.hop = hop
}

const Hop = new Hey('Poop')

console.log(Hop) //Hey { hop: 'Poop' }​​​​​

/* VS */// OLOO — Object Links to Other Object

const Yeh = {
  set makeHop(poh) {
    this.poh = poh
  }
}

const Poh = Object.create(Yeh)

console.log(Poh.poh = 'Poop') //Poop
console.log(Poh) //​​​​​{ poh: 'Poop' }​​​​​
