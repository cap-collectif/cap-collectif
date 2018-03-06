// @flow
import * as React from 'react';
import { ListGroup } from 'react-bootstrap';
import { SortableContainer } from 'react-sortable-hoc';
import RegistrationSortableQuestion from './RegistrationSortableQuestion';

export const RegistrationQuestionSortableList = (
  { items }: { items: Array<Object> } // eslint-disable-line
) => (
  <ListGroup>
    {items.map((value, index) => (
      <RegistrationSortableQuestion key={`item-${index}`} index={index} value={value} />
    ))}
  </ListGroup>
);

export default SortableContainer(RegistrationQuestionSortableList);
