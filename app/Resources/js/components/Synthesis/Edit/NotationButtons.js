import React from 'react';
import { Button } from 'react-bootstrap';

type Props = {
  notation: number,
  onChange: Function,
  block: boolean,
};

class NotationButtons extends React.Component<Props> {
  getNotationStarsClasses = () => {
    const { notation } = this.props;
    const classes = [];
    for (let i = 0; i < 5; i++) {
      if (i < notation) {
        classes[i] = 'active';
      }
    }
    return classes;
  };

  note = value => {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  render() {
    const { block } = this.props;
    const classes = this.getNotationStarsClasses();
    return (
      <div className="element__action">
        <Button bsSize="large" className="element__action-notation" block={block}>
          <a className={classes[4]} id="notation-button-5" onClick={this.note.bind(this, 5)}>
            <i className="cap cap-star-1-1" />
          </a>
          <a className={classes[3]} id="notation-button-4" onClick={this.note.bind(this, 4)}>
            <i className="cap cap-star-1-1" />
          </a>
          <a className={classes[2]} id="notation-button-3" onClick={this.note.bind(this, 3)}>
            <i className="cap cap-star-1-1" />
          </a>
          <a className={classes[1]} id="notation-button-2" onClick={this.note.bind(this, 2)}>
            <i className="cap cap-star-1-1" />
          </a>
          <a className={classes[0]} id="notation-button-1" onClick={this.note.bind(this, 1)}>
            <i className="cap cap-star-1-1" />
          </a>
        </Button>
      </div>
    );
  }
}

export default NotationButtons;
