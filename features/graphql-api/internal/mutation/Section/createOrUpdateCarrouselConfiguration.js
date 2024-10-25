import '../../../_setup';

const createOrUpdateCarrouselConfigurationMutation = /* GraphQL */ `
  mutation CreateOrUpdateCarrouselConfigurationMutation($input: CreateOrUpdateCarrouselConfigurationInput!) {
    createOrUpdateCarrouselConfiguration(input: $input) {
      errorCode
      carrouselConfiguration {
        position
        enabled
        isLegendEnabledOnImage
        carrouselElements {
          edges {
            node {
              type
              position
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
  }
`;

const input = {
  "enabled": false,
  "isLegendEnabledOnImage": true,
  "carrouselElements": [
    {
      "id": "U2VjdGlvbkNhcnJvdXNlbEVsZW1lbnQ6U2VjdGlvbkNhcnJvdXNlbEVsZW1lbnQx",
      "type": "EVENT",
      "title": "Titre de l'événement",
      "description": "Description de l'événement",
      "isDisplayed": false,
      "redirectLink": "https://www.exemple.com",
      "buttonLabel": "Libellé du bouton",
      "image": "GiecLogo",
      "position": 1
    },
    {
      "type": "ARTICLE",
      "title": "Titre de l'article",
      "description": "Description de l'article",
      "isDisplayed": false,
      "redirectLink": "https://www.exemple.com",
      "buttonLabel": "Libellé du bouton",
      "image": "imageOculus",
      "position": 2
    }
  ]
}

describe('mutations.createOrUpdateCarrouselConfigurationMutation', () => {
  it('should create and update a CarrouselConfiguration as admin', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: input },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not create more than 8 section carrousel items', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        {
          input: {
            ...input,
            carrouselElements: [
              ...input.carrouselElements,
              {
                "type": "ARTICLE",
                "title": "Titre de l'article",
                "description": "Description de l'article",
                "isDisplayed": false,
                "redirectLink": "https://www.exemple.com",
                "buttonLabel": "Libellé du bouton",
                "image": "imageOculus",
                "position": 4
              },
              {
                "type": "ARTICLE",
                "title": "Titre de l'article",
                "description": "Description de l'article",
                "isDisplayed": false,
                "redirectLink": "https://www.exemple.com",
                "buttonLabel": "Libellé du bouton",
                "image": "imageOculus",
                "position": 5
              },
              {
                "type": "ARTICLE",
                "title": "Titre de l'article",
                "description": "Description de l'article",
                "isDisplayed": false,
                "redirectLink": "https://www.exemple.com",
                "buttonLabel": "Libellé du bouton",
                "image": "imageOculus",
                "position": 6
              }
            ]
          }
        },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not create and update a CarrouselConfiguration as user', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: input },
        'internal_user',
      )
    ).rejects.toThrowError('Access denied to this field.');
  });
})
