// @flow
import * as React from 'react';
import {
  DragDropContext,
  type OnDragEndResponder,
  type OnDragUpdateResponder,
} from 'react-beautiful-dnd';
import ContextContainer from './Context.style';

type ContextProps = {
  onDragEnd: OnDragEndResponder,
  children: React.Node,
  onDragUpdate?: OnDragUpdateResponder,
};

const Context = ({ children, onDragEnd, onDragUpdate }: ContextProps) => (
  <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
    <ContextContainer>{children}</ContextContainer>
  </DragDropContext>
);

export default Context;
