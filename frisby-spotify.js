import { of } from 'folktale/concurrency/task'
import { findArtist, relatedArtists } from './spotify'
import { List } from 'immutable-ext'

const Pair = (x, y) =>
({
  x,
  y,
  concat: ({x: x1, y: y1}) =>
    Pair(x.concat(x1), y.concat(y1)),
  toList: () => [Object.values(x)[0], Object.values(y)[0]]
})

const Sum = x =>
({
  x,
  empty: () => Sum(0),
  concat: ({x: y}) => Sum(x + y),
  inspect: () => `Sum(${x})`
})

const Intersection = xs =>
({
  xs,
  concat: ({xs: ys}) =>
    Intersection(xs.filter(x =>
      ys.some(y => x ===y)))
})

const related = name =>
  findArtist(name)
  .map(artist => artist.id)
  .chain(relatedArtists)
  .map(artists =>
    artists.map(artist => artist.name))

const artistIntersection = rels =>
  rels
  .foldMap(x =>
    Pair(Intersection(x), Sum(x.length)))
  .toList()

const main = names =>
  List(names)
  .traverse(of, related)
  .map(artistIntersection)
  .run().future()
  .map(console.log)

const names = ['oasis', 'blur', 'radiohead']

main(names)