import Task from 'folktale/concurrency/task'
import { findArtist, relatedArtists } from './spotify'

const related = name =>
  findArtist(name)
  .map(artist => artist.id)
  //.chain(relatedArtists)

const main = ([name1, name2]) =>
  Task.of(rels1 => rels2 => [rels1, rels2])
  .ap(related(name1))
  .ap(related(name2))

const names = ['oasis', 'blur']

names.map(main)
.map(console.log)
//.mapRejected(console.log)