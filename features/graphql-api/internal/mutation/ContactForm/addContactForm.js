import '../../../_setup';

const AddContactFormMutation = /* GraphQL */ `
  mutation AddContactForm($input: AddContactFormInput!) {
      addContactForm(input: $input) {
        contactForm {
          email
          title
          confidentiality
          body
          translations {
            locale
            title
          }
        }
      }
    }`;

const input = {
  "email": "admin1@admin.fr",
  "translations": [
    {
      "locale": "fr-FR",
      "title": "Ceci n'est pas un titre",
      "body": "holalala ca marche pas votre site c'est vraiment nul pourquoi vous etes nul en plus c'est pas open source en plus vous utilisez du javascript c'est pas francais comme technologie et mon chat vient de vomir et ma contribution n'a pas eu 15.000 j'aime et puis j'aime pas la démocratie c'est trop mainstream.",
      "confidentiality": "Vous ne lirez probablement jamais cela"
    },
    {
      "locale": "en-GB",
      "title": "This is not a title",
      "body": "holalala your website doesn't work it is really dumb why are you so dumb it is not even open source and you use javascript it is not french and my cat juste vomite and my contribution didn't have 15k likes and i dont like democracy, too mainstream",
      "confidentiality": "you won't even read that"
    }
  ]
}

describe('mutations.addContactFormInput', () => {
  it('wants to add contact form as admin', async () => {
    await expect(
      graphql(
        AddContactFormMutation,
        { input: input },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
})