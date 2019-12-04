// @flow
import * as React from 'react';
import { Button, Collapse } from 'react-bootstrap';

type Props = {
  children: any,
  isOpen: boolean,
  id: string,
  onClick: (id: string) => void,
  label: string,
};

export default class CollapseItem extends React.Component<Props> {
  render() {
    const { id, isOpen, onClick, children, label } = this.props;
    return (
      <>
        <Button
          className="w-100 block--bordered"
          style={{ borderRadius: '2px', borderBottom: isOpen ? 0 : '' }}
          onClick={onClick.bind(this, id)}
          aria-expanded={isOpen}>
          <h4 className="pull-left font-weight-bold mt-10" style={{ color: '#0782C1' }}>
            {label}
          </h4>
        </Button>
        <Collapse in={isOpen}>
          <div>{children}</div>
        </Collapse>
      </>
    );
  }
}
