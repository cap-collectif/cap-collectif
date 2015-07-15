import SynthesisElementActions from '../../actions/SynthesisElementActions';

const NotationButtons = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getNotationStarsClasses() {
    let classes = [];
    for (let i = 0; i < 5; i++) {
      if (i < this.props.element.notation) {
        classes[i] = 'active';
      }
    }
    return classes;
  },

  render() {
    const classes = this.getNotationStarsClasses();
    return (
      <div className="element__action">
        <div className="element__action-notation btn btn-default btn-lg" title="Noter">
          <a className={classes[4]} onClick={this.note.bind(this, 5)}>
            <i className="cap cap-star-1"></i>
          </a>
          <a className={classes[3]} onClick={this.note.bind(this, 4)}>
            <i className="cap cap-star-1"></i>
          </a>
          <a className={classes[2]} onClick={this.note.bind(this, 3)}>
            <i className="cap cap-star-1"></i>
          </a>
          <a className={classes[1]} onClick={this.note.bind(this, 2)}>
            <i className="cap cap-star-1"></i>
          </a>
          <a className={classes[0]} onClick={this.note.bind(this, 1)}>
            <i className="cap cap-star-1"></i>
          </a>
        </div>
      </div>
    );
  },

  note(value) {
    const data = { 'notation': value };
    SynthesisElementActions.note(this.props.synthesis.id, this.props.element.id, data);
  },

});

export default NotationButtons;
