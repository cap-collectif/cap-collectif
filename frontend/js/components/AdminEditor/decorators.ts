import { CompositeDecorator } from 'draft-js'
import Link from './renderer/Link'

export const linkStrategy = (
  contentBlock: Record<string, any>,
  callback: (...args: Array<any>) => any,
  contentState: Record<string, any>,
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity()
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
  }, callback)
}
// It's possible to pass props here
const compositeDecorator = new CompositeDecorator([
  {
    strategy: linkStrategy,
    component: Link,
  },
])
export default compositeDecorator
