//* eslint-env jest */
const carrouselConfigurationQuery = /* GraphQL */ `
  query carrouselConfigurationQuery {
    carrouselConfiguration {
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
          }
        }
      }
    }
  }
`;

describe('Internal|Query carrouselConfiguration', () => {
  it('Get Carrousel Section Configuration as admin', async () => {
    await expect(graphql(carrouselConfigurationQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('Get Carrousel Section Configuration as user', async () => {
    await expect(graphql(carrouselConfigurationQuery, {}, 'internal_user')).resolves.toMatchSnapshot();
  });
});
