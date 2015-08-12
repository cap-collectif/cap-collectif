import OpinionArgumentForm from './OpinionArgumentForm';
import OpinionSourceForm from './OpinionSourceForm';
import OpinionSourceList from './OpinionSourceList';
import OpinionArgumentList from './OpinionArgumentList';
import Fetcher from '../../services/Fetcher';

const TabbedArea = ReactBootstrap.TabbedArea;
const TabPane = ReactBootstrap.TabPane;

const OpinionTabs = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      categories: [],
    };
  },

  componentDidMount() {
    Fetcher
    .get('/categories')
    .then((data) => {
      this.setState({categories: data});
      return true;
    });
  },

  render() {
    return (
      <TabbedArea defaultActiveKey={1} animation={false}>
        <TabPane eventKey={1} tab={this.props.opinion.arguments_count + ' Arguments'}>
          <div className="row">
            <div className="col-sm-12 col-md-6">
               <div className="opinion opinion--add-argument block block--bordered">
                  <OpinionArgumentForm type="yes" opinion={this.props.opinion} />
                </div>
                <OpinionArgumentList type="yes" opinion={this.props.opinion} />
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="opinion opinion--add-argument block block--bordered">
                <OpinionArgumentForm type="no" opinion={this.props.opinion} />
              </div>
              <OpinionArgumentList type="no" opinion={this.props.opinion} />
            </div>
          </div>
        </TabPane>
        <TabPane eventKey={2} tab={this.props.opinion.sources_count + ' Sources'}>
          <br />
          <div className="row">
            <OpinionSourceForm categories={this.state.categories} opinion={this.props.opinion} />
          </div>
          <div className="row">
            <OpinionSourceList sources={this.props.opinion.sources} />
          </div>
        </TabPane>
      </TabbedArea>
    );
  },

});

export default OpinionTabs;
