import * as React from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import ListContainer, { ListItemContainer } from './List.style'
import Title, { TYPE } from '~/components/Ui/Title/Title'
import { DragnDropContext } from '../Context/Context'

type ListProps = {
  id: string
  children: any
  title?: string
  isDisabled?: boolean
  isCombineEnabled?: boolean
  isCombineOnly?: boolean
  hasPositionDisplayed?: boolean
}

const List = ({
  children,
  id,
  title,
  isDisabled,
  isCombineEnabled,
  isCombineOnly,
  hasPositionDisplayed,
}: ListProps) => {
  const listRef = React.useRef<HTMLUListElement>(null)
  const context = React.useContext(DragnDropContext)

  React.useEffect(() => {
    const element = listRef.current
    if (!element || isDisabled) return

    if (context) {
      context.registerDroppable(id, element)
    }

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({ droppableId: id }),
      canDrop: () => !isDisabled,
    })

    return () => {
      cleanup()
      if (context) {
        context.unregisterDroppable(id)
      }
    }
  }, [id, isDisabled, context])

  return (
    <ListContainer hasPositionDisplayed={hasPositionDisplayed} id={id}>
      {title && (
        <Title type={TYPE.H3}>
          <FormattedMessage id={title} />
        </Title>
      )}
      <ul className="wrapper-item-container" ref={listRef}>
        {React.Children.toArray(children).map((child, i) => {
          const childElement = child as React.ReactElement
          let points: number | false = false

          if (
            childElement.props &&
            childElement.props.children &&
            childElement.props.children.props &&
            childElement.props.children.props.step
          ) {
            const availablePoints = Array.from(
              {
                length: childElement.props.children.props.step.votesLimit,
              },
              (_, l) => childElement.props.children.props.step.votesLimit - l,
            )
            points = availablePoints ? availablePoints[childElement.props.position] : false
          }

          return (
            <ListItemContainer key={i}>
              {hasPositionDisplayed && points && (
                <span className="item__position__point">
                  <FormattedHTMLMessage
                    id="item-point"
                    values={{
                      num: points,
                    }}
                  />
                </span>
              )}
              {React.cloneElement(childElement, {
                droppableId: id,
                isCombineEnabled,
                isCombineOnly,
              })}
            </ListItemContainer>
          )
        })}
      </ul>
    </ListContainer>
  )
}

export default List
