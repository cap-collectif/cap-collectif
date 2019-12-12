// @flow
import * as React from 'react';
import { DragDropContext, OnDragEndResponder, OnDragUpdateResponder } from 'react-beautiful-dnd';
import GroupListContainer from './GroupList.style';

type GroupListProps = {
  onDragEnd: OnDragEndResponder,
  children: React.Node,
  onDragUpdate?: OnDragUpdateResponder,
};

const GroupList = ({ children, onDragEnd, onDragUpdate }: GroupListProps) => (
  <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
    <GroupListContainer>{children}</GroupListContainer>
  </DragDropContext>
);

export default GroupList;
