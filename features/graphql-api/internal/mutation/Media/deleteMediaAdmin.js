/* eslint-env jest */
import '../../../_setup';

const fs = require('fs');
const path = require('path');

const DeleteMediaAdminMutation = /* GraphQL */ `
  mutation DeleteMediaAdminMutation($input: DeleteMediaAdminInput!) {
    deleteMediaAdmin(input: $input) {
      deletedMediaIds
    }
  }
`;
const basePath = path.join(process.cwd(), 'public/media/default/0001/01');

describe('Delete Media (admin media page)', () => {
  it('deletes one media as admin', async () => {
    const abbaPath = path.join(basePath, 'abba_money.jpg');
    await expect(fs.existsSync(abbaPath)).toBe(true);
    await fs.copyFileSync(abbaPath, `${abbaPath}.bak`);

    await expect(
      graphql(
        DeleteMediaAdminMutation,
        {
          input: {
            ids: ['user-type-business'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();

    await expect(fs.existsSync(abbaPath)).toBe(false);
    fs.copyFileSync(`${abbaPath}.bak`, abbaPath);
    fs.unlinkSync(`${abbaPath}.bak`);
  });

  it('deletes several medias as admin', async () => {
    const archivedPath = path.join(basePath, 'archived.jpeg');
    const bobMarleyPath = path.join(basePath, 'bob-marley.jpg');
    await expect(fs.existsSync(archivedPath)).toBe(true);
    await expect(fs.existsSync(bobMarleyPath)).toBe(true);
    await fs.copyFileSync(archivedPath, `${archivedPath}.bak`);
    await fs.copyFileSync(bobMarleyPath, `${bobMarleyPath}.bak`);

    await expect(
      graphql(
        DeleteMediaAdminMutation,
        {
          input: {
            ids: ['imageArchived', 'ProfilePicBobMarley'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();

    await expect(fs.existsSync(archivedPath)).toBe(false);
    await expect(fs.existsSync(bobMarleyPath)).toBe(false);
    fs.copyFileSync(`${archivedPath}.bak`, archivedPath);
    fs.copyFileSync(`${bobMarleyPath}.bak`, bobMarleyPath);
    fs.unlinkSync(`${archivedPath}.bak`);
    fs.unlinkSync(`${bobMarleyPath}.bak`);
  });

  it('deletes several medias, one of them is an invalid ID, as admin', async () => {
    const cafePath = path.join(basePath, 'cafe.png');
    await expect(fs.existsSync(cafePath)).toBe(true);
    await fs.copyFileSync(cafePath, `${cafePath}.bak`);

    await expect(
      graphql(
        DeleteMediaAdminMutation,
        {
          input: {
            ids: ['imageCafe', 'fake-id'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();

    await expect(fs.existsSync(cafePath)).toBe(false);
    fs.copyFileSync(`${cafePath}.bak`, cafePath);
    fs.unlinkSync(`${cafePath}.bak`);
  });
});
