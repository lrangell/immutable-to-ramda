import {fromJS, fromArray} from 'immutable'

const pojo: Record<string, number> = {foo: 5}
const obj = fromJS(pojo)
const arr = fromArray([1])
const aaaa = obj.toJS()
const [p, def] = [['a'], 0]
const [a, b, c] = [0, 1, 2]

obj.get(p)
obj.getIn([a, b, c])

const foob = obj.get('aaaa')
const fooz = obj.get(p)

function blaa(a: number) {
  return 4
}

const zop = obj.getIn(['aaaa', 'b'], 0)
