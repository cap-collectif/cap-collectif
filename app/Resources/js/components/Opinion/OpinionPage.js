import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionBox from './OpinionBox';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const TabbedArea = ReactBootstrap.TabbedArea;
const TabPane = ReactBootstrap.TabPane;

const OpinionPage = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number,
    opinionInitialText: React.PropTypes.text,
    versionId: React.PropTypes.number,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      opinion: null,
      isLoading: true,
    };
  },

  componentDidMount() {

    Fetcher
    .get('/opinions/' + this.props.opinionId +
         '/versions/' + this.props.versionId
    )
    .then((data) => {
      this.setState({
        opinion: data.version,
        isLoading: false
      });
      return true;
    });

  },

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className= "row">
          <div className="col-xs-2 col-xs-offset-6">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  render() {
    return (
      <div className="col-xs-12 col-sm-8 col-md-9 has-chart" id="details">
        <div className="row">
          { this.renderLoader() }
          {!this.state.isLoading
            ? <OpinionBox {...this.props} opinion={this.state.opinion} />
            : <span />
          }
          <TabbedArea defaultActiveKey={1} animation={false}>
            <TabPane eventKey={1} tab={this.state.opinion.arguments_count + ' Arguments'}>
              <div className="row">
                <div className="col-sm-12 col-md-6">                                                                                                                            <div className="opinion  opinion--add-argument  block  block--bordered">
                  <div className="opinion__body box">
                    <div className="opinion__data">
                      <form method="post">
                        <div className="form-group">
                          <label className="sr-only" for="argyes-input">Ajouter un argument  pour</label>
                          <textarea id="argyes-input" name="argumentFormYes[body]" required="required" rows="2" data-toggle="collapse" href=".argyes-btns" placeholder="Ajouter un argument pour" className="form-control"></textarea>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="block--tablet  block--bordered  opinion__arguments--yes">
                  <div className="opinion__arguments__header  row">
                    <h4 className="col-xs-6  col-sm-12  col-md-6  h4  opinion__header__title">1 argument  pour  </h4>
                    <div className="col-xs-6  col-sm-12  col-md-6">
                     <div className="filter">
                      <form name="sortArgumentsForm" method="post" action="">
                        <div className="formgroup--inline">
                          <label className="control-label  hidden-xs control-label" for="sortArgumentsForm_argumentSort">
                            Trier par
                          </label>
                          <label className="control-label  sr-only  visible-xs control-label" for="sortArgumentsForm_argumentSort">
                            Trier par
                          </label>
                          <span className="formgroup--inline__control">
                              <select id="sortArgumentsForm_argumentSort" name="sortArgumentsForm[argumentSort]" onchange="this.form.submit()" className="form-control form-control">
                                <option value="date">Date</option>
                                <option value="popularity">Nombre de votes</option>
                              </select>
                          </span>
                        </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <ul className="media-list  opinion__list">
                    <li className="opinion  opinion--argument " id="arg-166">
                      <div className="opinion__body  box">
                        <a className="pull-left" href="/profile/user/lbrunet">
                          <img title="lbrunet" alt="lbrunet" className=" img-circle" style="width:45px; height:45px;" src="/media/cache/default_avatar/default/0001/01/8_default_avatar.jpg" />
                        </a>
                      <div className="opinion__data">
                        <p className="h5  opinion__user">
                            <a href="/profile/user/lbrunet">
                                lbrunet
                            </a>
                        </p>
                        <p className="excerpt  opinion__date">5 août 2015 18:57</p>
                      </div>
                      <p className="opinion__text more" style="max-height: none; overflow: hidden; width: 100%;">
                        Iusto sint sequi facere nesciunt. Vel vitae alias non accusantium minus veritatis. Dolorum numquam dolores est quis ut ut quo. Rem suscipit non in voluptatem.
                      </p>
                      <form method="POST" style="display: inline-block;" action="/secure/consultations/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/causes/opinion-7/arguments/166/vote">
                        <a className="connection-popover-js" tabindex="0" data-original-title="" title="">
                          <button className="btn  btn-success  btn--outline  btn-xs"><i className="cap-hand-like-2"></i> D'accord</button>
                        </a>
                      </form>
                      <span className="opinion__votes-nb">0</span>
                      <a href="/consultations/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/causes/opinion-7/arguments/166/report"
                          className="btn btn-xs btn-dark-gray  btn--outline  connection-popover-js" tabindex="0" data-original-title="" title="">
                          <i className="cap cap-flag-1"></i> Signaler
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            </div>
            </TabPane>
            <TabPane eventKey={2} tab={this.state.opinion.sources_count +' Sources'}>

            </TabPane>
          </TabbedArea>
        </div>
      </div>
    );
  },

});

export default OpinionPage;
