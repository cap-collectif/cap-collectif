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
              extraData {
                startAt
                endAt
              }
            }
          }
        }
      }
    }
  }
`;

const commonInputFields = {
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
      "position": 1,
      "extraData": {
        'startAt': '2024-09-01T00:00:00.000Z',
        'endAt': '2060-09-01T00:00:00.000Z'
      }
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

const inputSectionTypeCarrousel = {
  "type": "carrousel",
  ...commonInputFields
}

const inputSectionTypeCarrouselHighlighted = {
  "type": "carrouselHighlighted",
  ...commonInputFields
}

describe('mutations.createOrUpdateCarrouselConfigurationMutation', () => {
  it('should create and update a CarrouselConfiguration for carrousel section type as admin', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: inputSectionTypeCarrousel },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not create more than 8 section carrousel items for carrousel section type', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        {
          input: {
            ...inputSectionTypeCarrousel,
            carrouselElements: [
              ...inputSectionTypeCarrousel.carrouselElements,
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
  it('should not create and update a CarrouselConfiguration for carrousel section type as user', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: inputSectionTypeCarrousel },
        'internal_user',
      )
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('should create and update a CarrouselConfiguration for carrousel highlighted section type as admin', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: inputSectionTypeCarrouselHighlighted },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not create more than 8 section carrousel items for carrousel highlighted section type', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        {
          input: {
            ...inputSectionTypeCarrouselHighlighted,
            carrouselElements: [
              ...inputSectionTypeCarrouselHighlighted.carrouselElements,
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
  it('should not create and update a CarrouselConfiguration for carrousel highlighted section type as user', async () => {
    await expect(
      graphql(
        createOrUpdateCarrouselConfigurationMutation,
        { input: inputSectionTypeCarrouselHighlighted },
        'internal_user',
      )
    ).rejects.toThrowError('Access denied to this field.');
  });
})
