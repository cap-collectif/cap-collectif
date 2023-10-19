import * as React from 'react'
import type { OnDragEndResponder, OnDragUpdateResponder } from 'react-beautiful-dnd'
import { DragDropContext } from 'react-beautiful-dnd'
import ContextContainer from './Context.style'

type ContextProps = {
  onDragEnd: OnDragEndResponder
  children: JSX.Element | JSX.Element[] | string
  onDragUpdate?: OnDragUpdateResponder
}

const Context = ({ children, onDragEnd, onDragUpdate }: ContextProps) => (
  <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
    <ContextContainer>{children}</ContextContainer>
  </DragDropContext>
)

export default Context
