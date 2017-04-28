// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import Opinion from './Opinion';
import NewOpinionButton from '../Opinion/NewOpinionButton';

export const OpinionList = React.createClass({
  propTypes: {
    section: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { section } = this.props;
    return (
      <div
        id={`opinions--test17${section.slug}`}
        className="anchor-offset block  block--bordered">
        <div className={`opinion  opinion--${section.color} opinion--default`}>
          <div className="opinion__header  opinion__header--mobile-centered">
            <h2 className="pull-left  h4  opinion__header__title">
              {section.contributionsCount} propositions
            </h2>
            <div className="pull-right  opinion__header__filter">
              <NewOpinionButton
                opinionTypeSlug={section.slug}
                opinionTypeId={section.id}
                stepId={'5'}
                projectId={'5'}
                label={'Proposer'}
              />
              {section.contributionsCount > 1 &&
                <select
                  className="form-control"
                  style={{ marginLeft: 15 }}
                  onChange={value => {
                    console.log(value);
                    window.location.href = `${window.location.protocol}//${window.location.host}/project/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/types/sous-partie-1/${value}`;
                  }}>
                  <option value="">Trier par</option>
                  <option value="positions">Tri ordonné puis aléatoire</option>
                  <option value="random">Tri aléatoire</option>
                  <option value="last">Les plus récents</option>
                  <option value="old">Les plus anciens</option>
                  <option value="favorable">Les plus favorables</option>
                  <option value="votes">Les plus votés</option>
                  <option value="comments">Les plus commentés</option>
                </select>}
            </div>
          </div>
        </div>
        <ul className="media-list  opinion__list">
          {section.contributions.map((opinion, index) => (
            <Opinion key={index} opinion={opinion} />
          ))}
        </ul>
      </div>
    );
  },
});

export default createFragmentContainer(
  OpinionList,
  graphql`
    fragment OpinionList_section on Section {
      id
      slug
      color
      contributionsCount
      contributions {
        ...Opinion_opinion
      }
    }
  `,
);
