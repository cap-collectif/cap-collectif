import FormattedText from '../../services/FormattedText';

import ElementTitle from './ElementTitle';

const ViewElement = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderElementBody() {
    if (this.props.element.body) {
      return (
        <p className="synthesis__element__body">
          {FormattedText.strip(this.props.element.body)}
        </p>
      );
    }
  },

  render() {
    return (
      <li className="synthesis__element">
        <h3 className="h3  synthesis__element__title">
          <ElementTitle element={this.props.element} link={false} />
        </h3>
        {this.renderElementBody()}
      </li>
    );
  },

});

export default ViewElement;
