// @flow
/* eslint-env jest */
// import { features } from '../../redux/modules/default';
// import { intlMock } from '../../mocks';

describe('getProposalsMarkers', () => {
  it('should correctly filters only proposals that contains address and return them', () => {
    /* const proposals = [
      {
        title: 'Proposition pas encore votable',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/proposition-pas-encore-votable',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Test de publication avec accusé de réception',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/test-de-publication-avec-accuse-de-reception',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Proposition plus votable',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/proposition-plus-votable',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Ravalement de la façade de la bibliothèque municipale',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/ravalement-de-la-facade-de-la-bibliotheque-municipale',
        author: {
          username: 'welcomattic',
          url: 'https://capco.dev/profile/welcomattic',
          media: { url: 'media.png' },
        },
        address: {
          lat: 48.1051781,
          lng: -1.6744521,
        },
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title:
          "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/plantation-de-tulipes-dans-les-jardiniere-du-parking-de-leglise-avec-un-titre-tres-long-pour-tester-la-cesure',
        author: {
          username: 'user7',
          url: 'https://capco.dev/profile/user7',
          media: { url: 'media.png' },
        },
        address: {
          lat: 48.1133495,
          lng: -1.6984153,
        },
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Installation de bancs sur la place de la mairie',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/installation-de-bancs-sur-la-place-de-la-mairie',
        author: {
          username: 'welcomattic',
          url: 'https://capco.dev/profile/welcomattic',
          media: { url: 'media.png' },
        },
        address: {
          lat: 48.1113828,
          lng: -1.6792624,
        },
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Rénovation du gymnase',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/renovation-du-gymnase',
        author: {
          username: 'user',
          url: 'https://capco.dev/profile/user',
          media: { url: 'media.png' },
        },
        address: {
          lat: 48.11910899999999,
          lng: -1.6447289,
        },
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
    ]; */
    // const markers = getProposalsMarkers(proposals, features, null, intlMock);
    // expect(markers).toMatchSnapshot();
  });

  it('should correctly returns no markers when all proposals does not have registered address', () => {
    /* const proposals = [
      {
        title: 'Proposition pas encore votable',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/proposition-pas-encore-votable',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Test de publication avec accusé de réception',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/test-de-publication-avec-accuse-de-reception',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Proposition plus votable',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/proposition-plus-votable',
        author: {
          username: 'admin',
          url: 'https://capco.dev/profile/admin',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Ravalement de la façade de la bibliothèque municipale',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/ravalement-de-la-facade-de-la-bibliotheque-municipale',
        author: {
          username: 'welcomattic',
          url: 'https://capco.dev/profile/welcomattic',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title:
          "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/plantation-de-tulipes-dans-les-jardiniere-du-parking-de-leglise-avec-un-titre-tres-long-pour-tester-la-cesure',
        author: {
          username: 'user7',
          url: 'https://capco.dev/profile/user7',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Installation de bancs sur la place de la mairie',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/installation-de-bancs-sur-la-place-de-la-mairie',
        author: {
          username: 'welcomattic',
          url: 'https://capco.dev/profile/welcomattic',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
      {
        title: 'Rénovation du gymnase',
        url:
          'https://capco.dev/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/renovation-du-gymnase',
        author: {
          username: 'user',
          url: 'https://capco.dev/profile/user',
          media: { url: 'media.png' },
        },
        address: null,
        media: { url: 'media.jpg' },
        publishedAt: '1998-08-18 00:01:00',
      },
    ]; */
    // const markers = getProposalsMarkers(proposals, features, null, intlMock);
    // expect(markers).toMatchSnapshot();
  });
});
