/* eslint-env jest */

const AvailableDistrictsForLocalisationQuery = /* GraphQL */ `
  query AvailableDistrictsForLocalisationQuery($latitude: Float!, $longitude: Float!) {
    availableDistrictsForLocalisation(proposalFormId: "proposalForm1", latitude: $latitude, longitude: $longitude) {
      name
    }
  }
`

const AvailableLocalesQuery = /* GraphQL */ `
  query AvailableLocalesQuery {
    availableLocales {
      traductionKey
      code
      isEnabled
      isPublished
      isDefault
    }
  }
`

const AvailableLocalesIncludingDisabledQuery = /* GraphQL */ `
  query AvailableLocalesIncludingDisabledQuery {
    availableLocales(includeDisabled: true) {
      traductionKey
      code
      isEnabled
      isPublished
      isDefault
    }
  }
`

const ContactFormsQuery = /* GraphQL */ `
  query ContactFormsQuery {
    contactForms {
      email
      title
      body
    }
  }
`

const LocaleQuery = /* GraphQL */ `
  query LocaleQuery {
    defaultLocale {
      code
      traductionKey
      isEnabled
      isPublished
      isDefault
    }
    locales {
      traductionKey
      code
      isEnabled
      isPublished
      isDefault
    }
  }
`

const ExternalServiceConfigurationQuery = /* GraphQL */ `
  query ExternalServiceConfigurationQuery {
    externalServiceConfiguration(type: MAILER) {
      type
      value
    }
  }
`

const HomePageProjectsSectionConfigurationQuery = /* GraphQL */ `
  query HomePageProjectsSectionConfigurationQuery {
    homePageProjectsSectionConfiguration {
      title
      position
      teaser
      displayMode
      enabled
      nbObjects
      projects {
        edges {
          node {
            title
          }
        }
      }
    }
  }
`

const SenderEmailDomainsQuery = /* GraphQL */ `
  query SenderEmailDomainsQuery {
    senderEmailDomains {
      value
      service
      spfValidation
      dkimValidation
    }
  }
`

const SenderEmailsQuery = /* GraphQL */ `
  query SenderEmailsQuery {
    senderEmails {
      locale
      domain
      address
      isDefault
    }
  }
`

const ShieldAdminFormQuery = /* GraphQL */ `
  query ShieldAdminFormQuery {
    shieldAdminForm {
      shieldMode
      introduction
      media {
        id
        name
        url
      }
      translations {
        locale
        introduction
      }
    }
  }
`

const SiteParameterQuery = /* GraphQL */ `
  query SiteParameterQuery($keyname: String!) {
    siteParameter(keyname: $keyname) {
      keyname
      value
      isTranslatable
      translations {
        value
        locale
      }
    }
  }
`

const SiteFaviconQuery = /* GraphQL */ `
  query SiteFaviconQuery {
    siteFavicon {
      id
      keyname
      media {
        id
        url
      }
    }
  }
`

describe('Internal|Query configuration and internationalization', () => {
  it('returns districts for a matching location', async () => {
    await expect(
      graphql(AvailableDistrictsForLocalisationQuery, { latitude: 48.1159675, longitude: -1.7234738 }, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('returns no district for a location outside every district', async () => {
    await expect(
      graphql(AvailableDistrictsForLocalisationQuery, { latitude: 32.1159675, longitude: -13.7234738 }, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('returns enabled locales to an administrator by default', async () => {
    await expect(graphql(AvailableLocalesQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns disabled locales to an administrator when requested', async () => {
    await expect(graphql(AvailableLocalesIncludingDisabledQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns contact forms anonymously', async () => {
    await expect(graphql(ContactFormsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns the default and published locales anonymously', async () => {
    await expect(graphql(LocaleQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns the mailer configuration to an administrator', async () => {
    await expect(graphql(ExternalServiceConfigurationQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns the most recent home-page project section anonymously', async () => {
    await expect(graphql(HomePageProjectsSectionConfigurationQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns sender email domains to an administrator', async () => {
    await expect(graphql(SenderEmailDomainsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns every sender email to an administrator', async () => {
    await expect(graphql(SenderEmailsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns only the default sender email to a project owner', async () => {
    await expect(graphql(SenderEmailsQuery, {}, 'internal_theo')).resolves.toMatchSnapshot()
  })

  it('returns the shield configuration to an administrator', async () => {
    await expect(graphql(ShieldAdminFormQuery, {}, 'internal_admin')).resolves.toMatchSnapshot({
      shieldAdminForm: {
        shieldMode: expect.any(Boolean),
        introduction: expect.any(String),
        media: {
          id: expect.any(String),
          name: expect.any(String),
          url: expect.any(String),
        },
        translations: [{ locale: 'fr-FR', introduction: expect.any(String) }],
      },
    })
  })

  it.each([
    ['contact.title', 'translated site parameter'],
    ['global.timezone', 'non-translatable site parameter'],
    ['i.wish.i.exist', 'missing site parameter'],
  ])('returns the %s %s', async keyname => {
    await expect(graphql(SiteParameterQuery, { keyname }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns the current favicon anonymously', async () => {
    await expect(graphql(SiteFaviconQuery, {}, 'internal')).resolves.toMatchSnapshot({
      siteFavicon: { id: expect.any(String) },
    })
  })
})
