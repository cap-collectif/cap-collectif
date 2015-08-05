import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionPreview from './OpinionPreview';
import OpinionVoteButtons from './OpinionVoteButtons';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const OpinionBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.Required,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
    };
  },

  componentDidMount() {

    let data = new google.visualization.DataTable();

    // let data = new google.visualization.arrayToDataTable([
    //   ['D\'accord',     this.props.version.votes_ok ? 5 : 6],
    //   ['Mitigé',        this.props.version.votes_mitige ? 5 : 6],
    //   ['Pas d\'accord', this.props.version.votes_nok ? 5 : 6],
    // ]);

    data.addColumn('string', 'Task');
    data.addColumn('number', 'Values');
    data.addRows([
      ["D'accord", this.props.opinion.votes_ok],
      ["Mitigé", this.props.opinion.votes_mitige],
      ["Pas d'accord", this.props.opinion.votes_nok]
    ]);

    const pieChart = new google.visualization.PieChart(React.findDOMNode(this.refs.piechart));
    pieChart.draw(data, {
      legend: 'none',
      colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
      pieSliceText: 'value',
      // height: 90,
      // width: 145,
      backgroundColor: 'transparent'
    });

  },


  render() {
    const opinion = this.props.opinion;
    return (
      <div className="block block--bordered opinion__details">
        <div className="opinion  opinion--red  opinion--current">
          <div className="opinion__header  opinion__header--centered">
            <a className="neutral-hover  pull-left  h4  opinion__header__back" href="/consultations/open-data-liberer-les-donnees-publiques/consultation/consultation-1/opinions/probleme">
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs  hidden-sm"> Retour</span>
            </a>
            <h2 className="h4  opinion__header__title">Problème </h2>
          </div>
          <OpinionPreview opinion={opinion} />
        </div>
        <div className="opinion__description">
          <div ref="piechart" className="opinion__chart center-block" />
          { opinion.body }

          <div className="opinion__buttons">

            <OpinionVoteButtons />

            <div className="pull-right opinion__action-buttons">
              <div className="opinion__vote-group">
                <div className="dropdown  dropdown--custom">
                  <button className="btn  btn-default btn-dark-gray  btn--outline" type="button" data-toggle="dropdown">
                    <i className="cap cap-link"></i>
                    Partager
                    <span className="caret" />
                  </button>
                  <ul className="dropdown-menu" role="menu">
                    <li>
                        <a href="http://www.facebook.com/sharer.php?u=http%3A%2F%2Fwww.parlement-et-citoyens.fr%2Fconsultations%2Fopen-data-liberer-les-donnees-publiques%2Fconsultation%2Fconsultation-1%2Fopinions%2Fprobleme%2Fla-legislation-encadrant-l-ouverture-des-donnees-publiques-n-est-pas-adaptee-aux-attentes-des-reutilisateurs-citoyens-developpeurs-ong-et-entreprises-ni-aux-possibilites-de-traitement-qu-offrent-les-technologies-actuelles%23details&amp;t=La%20l%C3%A9gislation%20encadrant%20l%E2%80%99ouverture%20des%20donn%C3%A9es%20publiques%20n%E2%80%99est%20pas%20adapt%C3%A9e%20aux%20attentes%20des%20r%C3%A9utilisateurs%20%28citoyens%2C%20d%C3%A9veloppeurs%2C%20ONG%20et%20entreprises%29%2C%20ni%20aux%20possibilit%C3%A9s%20de%20traitement%20qu%E2%80%99offrent%20les%20technologies%20actuelles." onclick="window.open(this.href, 'Facebook', config='height=500, width=700, toolbar=no, menubar=no'); return false" title="Partager sur Facebook">
                            <i className="cap cap-facebook"></i> Facebook
                        </a>
                    </li>
                    <li>
                        <a href="http://twitter.com/share?url=http%3A%2F%2Fwww.parlement-et-citoyens.fr%2Fconsultations%2Fopen-data-liberer-les-donnees-publiques%2Fconsultation%2Fconsultation-1%2Fopinions%2Fprobleme%2Fla-legislation-encadrant-l-ouverture-des-donnees-publiques-n-est-pas-adaptee-aux-attentes-des-reutilisateurs-citoyens-developpeurs-ong-et-entreprises-ni-aux-possibilites-de-traitement-qu-offrent-les-technologies-actuelles%23details&amp;text=La%20l%C3%A9gislation%20encadrant%20l%E2%80%99ouverture%20des%20donn%C3%A9es%20publiques%20n%E2%80%99est%20pas%20adapt%C3%A9e%20aux%20attentes%20des%20r%C3%A9utilisateurs%20%28citoyens%2C%20d%C3%A9veloppeurs%2C%20ONG%20et%20entreprises%29%2C%20ni%20aux%20possibilit%C3%A9s%20de%20traitement%20qu%E2%80%99offrent%20les%20technologies%20actuelles." onclick="window.open(this.href, 'Twitter', config='height=500, width=700, toolbar=no, menubar=no'); return false" title="Partager sur Facebook">
                            <i className="cap cap-twitter"></i> Twitter
                        </a>
                    </li>
                    <li>
                        <a href="https://plus.google.com/share?url=http%3A%2F%2Fwww.parlement-et-citoyens.fr%2Fconsultations%2Fopen-data-liberer-les-donnees-publiques%2Fconsultation%2Fconsultation-1%2Fopinions%2Fprobleme%2Fla-legislation-encadrant-l-ouverture-des-donnees-publiques-n-est-pas-adaptee-aux-attentes-des-reutilisateurs-citoyens-developpeurs-ong-et-entreprises-ni-aux-possibilites-de-traitement-qu-offrent-les-technologies-actuelles%23details&amp;title=La%20l%C3%A9gislation%20encadrant%20l%E2%80%99ouverture%20des%20donn%C3%A9es%20publiques%20n%E2%80%99est%20pas%20adapt%C3%A9e%20aux%20attentes%20des%20r%C3%A9utilisateurs%20%28citoyens%2C%20d%C3%A9veloppeurs%2C%20ONG%20et%20entreprises%29%2C%20ni%20aux%20possibilit%C3%A9s%20de%20traitement%20qu%E2%80%99offrent%20les%20technologies%20actuelles." onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;" title="Partager sur Google+">
                            <i className="cap cap-gplus"></i> Google+
                        </a>
                    </li>
                    <li>
                        <a href="mailto:?subject=La%20l%C3%A9gislation%20encadrant%20l%E2%80%99ouverture%20des%20donn%C3%A9es%20publiques%20n%E2%80%99est%20pas%20adapt%C3%A9e%20aux%20attentes%20des%20r%C3%A9utilisateurs%20%28citoyens%2C%20d%C3%A9veloppeurs%2C%20ONG%20et%20entreprises%29%2C%20ni%20aux%20possibilit%C3%A9s%20de%20traitement%20qu%E2%80%99offrent%20les%20technologies%20actuelles.&amp;body=http%3A%2F%2Fwww.parlement-et-citoyens.fr%2Fconsultations%2Fopen-data-liberer-les-donnees-publiques%2Fconsultation%2Fconsultation-1%2Fopinions%2Fprobleme%2Fla-legislation-encadrant-l-ouverture-des-donnees-publiques-n-est-pas-adaptee-aux-attentes-des-reutilisateurs-citoyens-developpeurs-ong-et-entreprises-ni-aux-possibilites-de-traitement-qu-offrent-les-technologies-actuelles%23details" title="Partager par email">
                            <i className="cap cap-mail-2-1"></i> Email
                        </a>
                    </li>
                    <li>
                        <button className="btn-link" data-toggle="modal" data-target="#shareLink55c0cafc77ada">
                            <i className="cap cap-link-1"></i> Lien de partage
                        </button>
                    </li>
                  </ul>

                </div>
              </div>
              <div className="opinion__vote-group">
                <a href="/consultations/open-data-liberer-les-donnees-publiques/consultation/consultation-1/opinions/probleme/la-legislation-encadrant-l-ouverture-des-donnees-publiques-n-est-pas-adaptee-aux-attentes-des-reutilisateurs-citoyens-developpeurs-ong-et-entreprises-ni-aux-possibilites-de-traitement-qu-offrent-les-technologies-actuelles/report" className="btn  btn-dark-gray  btn--outline  connection-popover-js" tabindex="0" data-original-title="" title="">
                  <i className="cap cap-flag-1"></i>
                   Signaler
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

});

export default OpinionBox;
