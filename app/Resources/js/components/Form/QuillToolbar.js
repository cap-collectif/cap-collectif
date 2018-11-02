// @flow
import React from 'react';
// import { type IntlShape, FormattedMessage, injectIntl } from 'react-intl';

type Props = {
  // intl: IntlShape,
};

class QuillToolbar extends React.Component<Props> {
  render() {
    // const { intl } = this.props;

    return (
      <React.Fragment>
        <select className="ql-size">
          <option value="small">frfro</option>
          <option selected>frkn</option>
          <option value="large">fjipr</option>
          <option value="huge">flr</option>
        </select>
        <button className="ql-bold" >fre</button>
        <button className="ql-script" value="sub">fre</button>
        <button className="ql-script" value="super">ffre</button>
      </React.Fragment>
    );
  }
}

export default QuillToolbar;
