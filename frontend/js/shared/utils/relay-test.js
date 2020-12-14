// @flow
/* eslint-env jest */
import { formatConnectionPath } from './relay';

describe('formatConnectionPath', () => {
  const path = ['client', 'anIdOfEntity'];
  const key = 'FaceToFace_opinions';

  it('should format correctly connection path relay', () => {
    expect(formatConnectionPath(path, key)).toEqual(
      `client:anIdOfEntity:__FaceToFace_opinions_connection`,
    );
  });
});
