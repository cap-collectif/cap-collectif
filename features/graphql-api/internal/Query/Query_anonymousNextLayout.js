/* eslint-env jest */
import layoutQuery from '../../../../admin-next/__generated__/layoutQuery.graphql'

/**
 * @jest-status compliant
 * @jest-reason Executes the actual compiled Next.js layout query anonymously and checks that public data survives.
 */
it('loads the public Next.js layout without requesting an authenticated viewer', async () => {
  const result = await graphql(layoutQuery.params.text, {}, 'internal')

  expect(result).not.toHaveProperty('viewer')
  // The shared fixtures provide French as the default published locale.
  expect(result.locales).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'FR_FR', isDefault: true, isEnabled: true, isPublished: true }),
    ]),
  )
})
