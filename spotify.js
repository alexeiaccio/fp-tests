// https://api.spotify.com/v1/search?q=${query}&type=track  // artists: {item: []}
// https://api.spotify.com//v1/artists/{id}/related-artists // artists: []

import request from 'request'
import Task, { task } from 'folktale/concurrency/task'
import Result from 'folktale/result'
//import Maybe from 'folktale/maybe'

const httpGet = url =>
  task(resolver =>
    request(url, { auth: { 'bearer': 'BQCz-3K73cFKvby46bcXgBT1e2tt7JufxQbdfOouvlTOlsL56uN3Med_KUBECUFkWEre2KWBe43rNdY6aevGfDDjjQwYiQS7iYbbbx5l3F6YRv3NVwCmS0rp0deJNdwpQfpP6-IfvwIGfzywGWtH4AvOkDOSoHlxGBIS'} }, (error, response, body) =>
      error ? resolver.reject(error): resolver.resolve(body)))

const getJSON = url =>
    httpGet(url)
    .map(parse)
    .chain(resultToTask)

const first = xs => Result.fromNullable(xs[0], 'Error on get first')

const resultToTask = e =>
  e.matchWith({
    Error: (x) => Task.rejected(x),
    Ok:    (x) => Task.of(x.value)
  })

const parse = x => Result.try(_ => JSON.parse(x))

const findArtist = name =>
  getJSON(`https://api.spotify.com/v1/search?q=${name}&type=artist`)
  .map(result => result.artists.items)
  .map(first)
  .chain(resultToTask)

  const relatedArtists = id =>
    getJSON(`https://api.spotify.com/v1/artists/${id}/related-artists`)
    .map(result => result.artists)

module.exports = {
  findArtist,
  relatedArtists
}