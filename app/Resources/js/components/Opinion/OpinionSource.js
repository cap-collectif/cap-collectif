import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionSourceButtons from './OpinionSourceButtons';

const OpinionSource = React.createClass({
  propTypes: {
    source: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const source = this.props.source;
    return (
      <li className="opinion block--bordered has-chart">
        <div className="row">
          <div className="col-xs-12">
          <div className="opinion__body box">
            <UserAvatar user={source.author} />
            <div className="opinion__data">
              <OpinionInfos opinion={source} />
              <h3 className="opinion__title">
                <a href={source.link}>
                  { source.title }
                </a>
              </h3>
              <p className="excerpt">
                { source.body }
              </p>
              <p className="opinion__votes excerpt small">
                <OpinionSourceButtons source={source} />
              </p>
            </div>
            </div>
          </div>
        </div>
      </li>
    );
  },

});

export default OpinionSource;
