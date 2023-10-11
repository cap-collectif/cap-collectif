/* eslint-env jest */
import path from 'path';
import fs from 'fs';
import '../../../../_setup';

const DeleteFontMutation = /* GraphQL */ `
  mutation DeleteFontMutation($input: DeleteFontInput!) {
    deleteFont(input: $input) {
      deletedFontId
      userErrors {
        message
      }
    }
  }
`;

describe('Internal|deleteFont mutation', () => {
  it('should delete a custom added font', async () => {
    const file = fs.readFileSync(path.join(__dirname, '../../__files__/lato.zip'));
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', file, {
      contentType: 'application/zip',
      name: 'file',
      filename: 'Lato.zip',
    });
    const uploadFontResponse = await (
      await fetch('https://capco.test/login_check', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          username: 'admin@test.com',
          password: 'admin',
        }),
      }).then(_ =>
        fetch('https://capco.test/api/upload/fonts', {
          method: 'POST',
          body: form,
        }),
      )
    ).json();

    const newFontId = uploadFontResponse.id;

    const response = await graphql(
      DeleteFontMutation,
      {
        input: {
          id: newFontId,
        },
      },
      'internal_admin',
    );

    expect(response.deleteFont.deletedFontId).toBe(newFontId);
  });

  it('should throw an error when trying to delete a non-custom font', async () => {
    const response = await graphql(
      DeleteFontMutation,
      {
        input: {
          id: toGlobalId('Font', 'arialFont'),
        },
      },
      'internal_admin',
    );

    expect(response.deleteFont.userErrors[0].message).toBe('Tried to remove a non-custom font.');
  });
});
