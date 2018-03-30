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
