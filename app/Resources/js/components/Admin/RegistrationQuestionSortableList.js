// @flow
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { SortableContainer } from 'react-sortable-hoc';
import RegistrationSortableQuestion from './RegistrationSortableQuestion';

export default SortableContainer(({ items }) =>
  <ListGroup>
    {
      items.map((value, index) =>
        <RegistrationSortableQuestion key={`item-${index}`} index={index} value={value} />,
      )
    }
  </ListGroup>,
);
