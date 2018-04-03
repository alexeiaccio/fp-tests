// https://api.spotify.com/v1/search?q=${query}&type=track  // artists: {item: []}
// https://api.spotify.com//v1/artists/{id}/related-artists // artists: []

import request from 'request'
import Task, { task } from 'folktale/concurrency/task'
import Maybe from 'folktale/maybe'

const httpGet = url =>
  task(resolver =>
  request(url, { auth: { 'bearer': 'BQBW9j6grWA1N__j_3IU5NJw2fY8npoowyH4fdc9JZ_g_3cW2hltY7QK1ElX0gPAiKkncrnw7FsWBva88wl3ImbRpEcZQIkO6FxBF4vTuItQc-oMdALyUeQaoKyAbl3xVHGZ2XKoWW0Tv4SSMEK3tUj7fI4ZkZeWFcGV'} }, (error, response, body) =>
    error ? resolver.reject(error): resolver.resolve(body)))

const getJSON = url =>
    httpGet(url)
    .run().future()
    .map(JSON.parse)

const first = xs => Maybe.fromNullable(xs[0])

const maybeToTask = e =>
  e.map(Task.of).getOrElse(Task.rejected)

const findArtist = name =>
  getJSON(`https://api.spotify.com/v1/search?q=${name}&type=artist`)
  .map(result => result.artists.items)
  .map(first)
  //.chain(maybeToTask)

  const relatedArtists = id =>
    getJSON(`https://api.spotify.com//v1/artists/${id}/related-artists`)
    .map(result => result.artists)

module.exports = {
  findArtist,
  relatedArtists
}