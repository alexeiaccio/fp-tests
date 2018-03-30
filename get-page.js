import fetch from 'isomorphic-fetch'
import { fromPromised } from 'folktale/concurrency/task'
import Result from 'folktale/result'
import getPages from './text-helpers'

const fetchPage = path => 
  fetch(`https://api.telegra.ph/getPage?path=${path}&return_content=true`)
    .then(res => res.json())
    
const checkResult = value =>
  value.ok                         ? Result.Ok(value)
: value.error === 'PAGE_NOT_FOUND' ? Result.Error('Page not found')
: /* otherwise */                    Result.Error(`Fetch error: ${value.error}`)

const getPageTask = fromPromised(fetchPage)
const getPageExecution = path => getPageTask(path)
  .run()
  .future()
  .listen({
    onCancelled: () => console.log('getPageExecution was cancelled'),
    onRejected:  (reason) => console.log(`Fetch error: ${reason}`),
    onResolved:  (value) => value
  })

const res1 = getPageExecution('api')
const res2 = getPageExecution('10-neistoricheskih-tezisov-o-kabbale-03-0')

//res1.map(x => console.log(x))
res1.map(value => 
  checkResult(value)
    .matchWith({
      Ok:    ({ value }) => console.log(getPages(value.result.content)),
      Error: ({ value }) => console.log(`Error: ${value}`)
    })
)
