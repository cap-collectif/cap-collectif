// @flow
import * as React from 'react';
import { SortableHandle } from 'react-sortable-hoc';

export const DragHandle = () => <div className="draghandle" />;

export default SortableHandle(DragHandle);
