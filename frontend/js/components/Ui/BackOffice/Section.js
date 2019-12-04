// @flow
import * as React from 'react';

type Props = {|
  title: string,
  children: any,
|};

export default class Section extends React.Component<Props> {
  render() {
    const { title, children } = this.props;

    return (
      <div className="box box-primary">
        <div className="box-header">
          <h3 className="box-title">{title}</h3>
        </div>
        <div className="box-body">{children}</div>
      </div>
    );
  }
}
