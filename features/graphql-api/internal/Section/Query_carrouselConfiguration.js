//* eslint-env jest */
const carrouselConfigurationQuery = /* GraphQL */ `
  query carrouselConfigurationQuery {
    carrouselConfiguration(type: "carrousel") {
      id
      title
      position
      enabled
      isLegendEnabledOnImage
      carrouselElements {
        edges {
          node {
            id
            type
            title
            description
            buttonLabel
            isDisplayed
            redirectLink
            image {
              url
              width
              height
            }
            startAt
            endAt
          }
        }
      }
    }
  }
`;

const carrouselHighlightedConfigurationQuery = /* GraphQL */ `
  query carrouselHighlightedConfigurationQuery {
    carrouselConfiguration(type: "carrouselHighlighted") {
      id
      title
      position
      enabled
      carrouselElements {
        edges {
          node {
            id
            type
            title
            description
            buttonLabel
            isDisplayed
            redirectLink
            image {
              url
              width
              height
            }
            startAt
            endAt
          }
        }
      }
    }
  }
`;

describe('Internal|Query carrouselConfiguration', () => {
  it('Get Carrousel Section Configuration as admin', async () => {
    await expect(
      graphql(carrouselConfigurationQuery, {}, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });

  it('Get Carrousel Section Configuration as user', async () => {
    await expect(
      graphql(carrouselConfigurationQuery, {}, 'internal_user'),
    ).resolves.toMatchSnapshot();
  });

  it('Get Carrousel Highlighted Section Configuration as admin', async () => {
    await expect(
      graphql(carrouselHighlightedConfigurationQuery, {}, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });

  it('Get Carrousel Highlighted Section Configuration as user', async () => {
    await expect(
      graphql(carrouselHighlightedConfigurationQuery, {}, 'internal_user'),
    ).resolves.toMatchSnapshot();
  });
});
