import React from 'react';

type Props = {
  element: Object,
  classes: string,
};

class ElementNotation extends React.Component<Props> {
  getNotationStarsClasses = () => {
    const { element } = this.props;
    const notation = element.notation;
    const classes = [];
    for (let i = 0; i < 5; i++) {
      if (i < notation) {
        classes[i] = 'active';
      }
    }
    return classes;
  };

  render() {
    const { element } = this.props;
    if (element.notation !== null) {
      const classes = this.getNotationStarsClasses();
      return (
        <span className="element__notation">
          <span id="notation-star-1" className={classes[0]}>
            <i className="cap cap-star-1" />
          </span>
          <span id="notation-star-2" className={classes[1]}>
            <i className="cap cap-star-1" />
          </span>
          <span id="notation-star-3" className={classes[2]}>
            <i className="cap cap-star-1" />
          </span>
          <span id="notation-star-4" className={classes[3]}>
            <i className="cap cap-star-1" />
          </span>
          <span id="notation-star-5" className={classes[4]}>
            <i className="cap cap-star-1" />
          </span>
        </span>
      );
    }
    return <span className="element__notation" />;
  }
}

export default ElementNotation;
