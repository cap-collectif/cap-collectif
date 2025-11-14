const nodeSlugQuery = /* GraphQL */ `
  query nodeSlug($entity: SluggableEntity!, $slug: String!, $projectSlug: String) {
    nodeSlug(entity: $entity, slug: $slug, projectSlug: $projectSlug) {
      __typename
      slug
    }
  }
`

describe('Internal|Query nodeSlug', () => {
  it('fetch ORGANIZATION with slug', async () => {
    const variables = { entity: 'ORGANIZATION', slug: 'giec' }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch consultation step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'collecte-des-avis',
      projectSlug: 'croissance-innovation-disruption',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch presentation step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'presentation-1',
      projectSlug: 'croissance-innovation-disruption',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch other step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'etape-personnalisee-ouverte',
      projectSlug: 'bp-avec-etape-personalisee-ouverte',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch collect step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'collecte-des-questions-chez-youpie',
      projectSlug: 'questions-responses',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch ranking step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'classement-des-propositions-et-modifications',
      projectSlug: 'croissance-innovation-disruption',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('selection questionnaire step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'questionnaire-food',
      projectSlug: 'food-project',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('selection debate step with slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'pour-ou-contre-le-reconfinement',
      projectSlug: 'debat-du-mois',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch PAGE with slug', async () => {
    const variables = {
      entity: 'PAGE',
      slug: 'how-it-works',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch PROJECT with slug', async () => {
    const variables = {
      entity: 'PROJECT',
      slug: 'croissance-innovation-disruption',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch DISTRICT with slug', async () => {
    const variables = {
      entity: 'DISTRICT',
      slug: 'first-district',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch PROPOSAL_DISTRICT with slug', async () => {
    const variables = {
      entity: 'PROPOSAL_DISTRICT',
      slug: 'beauregard',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch not found slug', async () => {
    const variables = {
      entity: 'STEP',
      slug: 'unknown',
      projectSlug: 'unknown',
    }
    await expect(graphql(nodeSlugQuery, variables, 'internal_admin')).rejects.toThrowError('Entity not found.')
  })
})
