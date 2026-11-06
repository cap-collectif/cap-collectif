'use client'

import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { Suspense } from 'react'
import { Box, CapUIIcon, Flex, Icon, Spinner, useTheme } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { SitemapQuery } from '@relay/SitemapQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'

const QUERY = graphql`
  query SitemapQuery {
    sitemap {
      projects {
        title
        url
        steps {
          title
          url
        }
      }
      headerItems {
        title
        link
        isExternalLink
        hasEnabledFeature
        children {
          title
          link
          isExternalLink
          hasEnabledFeature
        }
      }
      footerLinks {
        name
        url
        isExternalLink
      }
      footerLegals {
        cookies
        privacy
        legal
      }
      homeUrl
      sitemapUrl
      legalUrls {
        cookies
        privacy
        legal
      }
    }
  }
`

function SitemapContent() {
  const intl = useIntl()
  const { siteColors } = useAppContext()
  const { colors } = useTheme()
  const { sitemap: data } = useLazyLoadQuery<SitemapQuery>(QUERY, {}, { fetchPolicy: 'network-only' })
  const labels = Object.fromEntries(
    [
      'sitemap.title',
      'sitemap.current-page',
      'navbar.breadcrumb',
      'navbar.homepage',
      'global.menu',
      'global.footer',
      'global.participative.project',
      'registration.external_link',
      'cookies',
      'privacy-policy',
      'legal-mentions',
    ].map(id => [id, intl.formatMessage({ id })]),
  )
  const { homeUrl, sitemapUrl } = data
  const link = (href: string, label: string, external = false, className = '', current = false) =>
    !label?.trim() ? null : href ? (
      <Box
        as="a"
        href={href}
        className={`sitemap-link ${className}`}
        aria-current={current ? 'page' : undefined}
        color={siteColors.linkColor}
        fontWeight={
          ['sitemap-home-link', 'sitemap-footer-link', 'sitemap-project-link'].includes(className) ? 700 : undefined
        }
        display={className === 'sitemap-home-link' ? 'inline-flex' : undefined}
        alignItems={className === 'sitemap-home-link' ? 'center' : undefined}
        sx={{ overflowWrap: 'anywhere', textDecoration: 'underline', textUnderlineOffset: pxToRem(2) }}
        _hover={{ color: siteColors.linkHoverColor || siteColors.linkColor }}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
        {external && (
          <>
            <Box
              as="span"
              aria-hidden="true"
              className="sitemap-external-icon"
              display="inline-block"
              ml={1}
              verticalAlign="0.1em"
              sx={{ textDecoration: 'none' }}
            >
              ↗
            </Box>
            <span className="sr-only"> ({labels['registration.external_link']})</span>
          </>
        )}
      </Box>
    ) : (
      <span className={className}>{label}</span>
    )

  return (
    <Box
      id="sitemap-page"
      className="sitemap-page"
      width="100%"
      px={[4, 6]}
      pt={7}
      pb={12}
      sx={{ boxSizing: 'border-box' }}
    >
      <Box
        as="nav"
        aria-label={labels['navbar.breadcrumb']}
        className="sitemap-breadcrumb"
        maxWidth={pxToRem(1140)}
        mx="auto"
        mb={pxToRem(22)}
      >
        <Flex
          as="ol"
          className="sitemap-breadcrumb-list"
          alignItems="center"
          gap={2}
          m={0}
          p={0}
          sx={{ listStyle: 'none' }}
        >
          <li>{link(homeUrl, labels['navbar.homepage'])}</li>
          <Box as="li" aria-current="page">
            <Box as="span" aria-hidden="true" mr={2} color="neutral-gray.700">
              ›
            </Box>
            {labels['sitemap.title']}
          </Box>
        </Flex>
      </Box>
      <Box
        as="h1"
        className="sitemap-title"
        maxWidth={pxToRem(1140)}
        mx="auto"
        my={0}
        pb={[6, 8]}
        borderBottom={`${pxToRem(1)} solid`}
        borderColor="neutral-gray.200"
      >
        {labels['sitemap.title']}
      </Box>
      <Box className="sitemap-content" maxWidth={pxToRem(1140)} mx="auto" pt={pxToRem(26)}>
        <Flex className="sitemap-home-link-wrapper" alignItems="center" color={siteColors.linkColor} gap={2}>
          <Icon
            aria-hidden="true"
            className="sitemap-home-icon"
            name={CapUIIcon.Home}
            color={siteColors.linkColor}
            flex="0 0 auto"
            width={pxToRem(22)}
            height={pxToRem(22)}
          />
          {link(homeUrl, labels['navbar.homepage'], false, 'sitemap-home-link')}
        </Flex>
        <Box as="section" aria-labelledby="sitemap-menu-title" className="sitemap-section" mt={6}>
          <h2 id="sitemap-menu-title" className="sr-only">
            {labels['global.menu']}
          </h2>
          <Box as="ul" className="sitemap-tree" m={0} p={0} sx={{ listStyle: 'none' }}>
            {data.headerItems
              .filter(item => item.hasEnabledFeature && item.link !== homeUrl && item.title?.trim())
              .map((item, index) => (
                <Box
                  as="li"
                  className="sitemap-tree-item"
                  key={`${item.title}-${index}`}
                  position="relative"
                  mb={pxToRem(18)}
                  pl={7}
                  sx={{
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '0.65em',
                      left: 0,
                      width: pxToRem(7),
                      height: pxToRem(7),
                      borderRadius: '50%',
                      backgroundColor: colors['neutral-gray'][300],
                    },
                  }}
                >
                  <Box as="h3" className="sitemap-category-title" m={0} sx={{ overflowWrap: 'anywhere' }}>
                    {link(item.link, item.title || '', item.isExternalLink)}
                  </Box>
                  {item.children?.some(child => child.hasEnabledFeature && child.title?.trim()) && (
                    <Box
                      as="ul"
                      className="sitemap-tree-children"
                      position="relative"
                      mt={pxToRem(3)}
                      mb={0}
                      ml={pxToRem(6)}
                      pl={pxToRem(22)}
                      sx={{
                        listStyle: 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          bottom: pxToRem(10),
                          left: 0,
                          borderLeft: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                        },
                      }}
                    >
                      {item.children
                        .filter(child => child.hasEnabledFeature && child.title?.trim())
                        .map((child, childIndex) => (
                          <Box
                            as="li"
                            className="sitemap-tree-child"
                            key={`${child.title}-${childIndex}`}
                            position="relative"
                            my={pxToRem(7)}
                            sx={{
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '0.75em',
                                left: pxToRem(-22),
                                width: pxToRem(14),
                                borderTop: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                              },
                            }}
                          >
                            {link(child.link, child.title || '', child.isExternalLink)}
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
              ))}
            <Box
              as="li"
              className="sitemap-tree-item"
              position="relative"
              mb={pxToRem(18)}
              pl={7}
              sx={{
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '0.65em',
                  left: 0,
                  width: pxToRem(7),
                  height: pxToRem(7),
                  borderRadius: '50%',
                  backgroundColor: colors['neutral-gray'][300],
                },
              }}
            >
              <Box as="h3" className="sitemap-category-title" m={0} sx={{ overflowWrap: 'anywhere' }}>
                {labels['global.participative.project']}
              </Box>
              <Box
                as="ul"
                className="sitemap-tree-children"
                position="relative"
                mt={pxToRem(3)}
                mb={0}
                ml={pxToRem(6)}
                pl={pxToRem(22)}
                sx={{
                  listStyle: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: pxToRem(10),
                    left: 0,
                    borderLeft: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                  },
                }}
              >
                {data.projects
                  .filter(project => project.title?.trim())
                  .map(project => (
                    <Box
                      as="li"
                      className="sitemap-tree-child"
                      key={project.url}
                      position="relative"
                      my={pxToRem(7)}
                      sx={{
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '0.75em',
                          left: pxToRem(-22),
                          width: pxToRem(14),
                          borderTop: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                        },
                      }}
                    >
                      <Box as="h4" className="sitemap-project-title" m={0} sx={{ overflowWrap: 'anywhere' }}>
                        {link(project.url, project.title, false, 'sitemap-project-link')}
                      </Box>
                      {project.steps.some(step => step.title?.trim()) && (
                        <Box
                          as="ul"
                          className="sitemap-tree-children"
                          position="relative"
                          mt={pxToRem(3)}
                          mb={0}
                          ml={pxToRem(6)}
                          pl={pxToRem(22)}
                          sx={{
                            listStyle: 'none',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              bottom: pxToRem(10),
                              left: 0,
                              borderLeft: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                            },
                          }}
                        >
                          {project.steps
                            .filter(step => step.title?.trim())
                            .map(step => (
                              <Box
                                as="li"
                                className="sitemap-tree-child"
                                key={step.url}
                                position="relative"
                                my={pxToRem(7)}
                                sx={{
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '0.75em',
                                    left: pxToRem(-22),
                                    width: pxToRem(14),
                                    borderTop: `${pxToRem(2)} solid ${colors['neutral-gray'][200]}`,
                                  },
                                }}
                              >
                                {link(step.url, step.title)}
                              </Box>
                            ))}
                        </Box>
                      )}
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          as="section"
          aria-labelledby="sitemap-footer-title"
          className="sitemap-footer-section"
          maxWidth={pxToRem(700)}
          mt={pxToRem(30)}
          pt={5}
          borderTop={`${pxToRem(1)} solid`}
          borderColor="neutral-gray.200"
        >
          <h2 id="sitemap-footer-title" className="sr-only">
            {labels['global.footer']}
          </h2>
          <Box as="ul" className="sitemap-footer-list" m={0} p={0} sx={{ listStyle: 'none' }}>
            {data.footerLegals.cookies && (
              <Box
                as="li"
                position="relative"
                mb={4}
                pl={7}
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '0.65em',
                    left: 0,
                    width: pxToRem(7),
                    height: pxToRem(7),
                    borderRadius: '50%',
                    backgroundColor: colors['neutral-gray'][300],
                  },
                }}
              >
                {link(data.legalUrls.cookies, labels.cookies, false, 'sitemap-footer-link')}
              </Box>
            )}
            {data.footerLegals.privacy && (
              <Box
                as="li"
                position="relative"
                mb={4}
                pl={7}
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '0.65em',
                    left: 0,
                    width: pxToRem(7),
                    height: pxToRem(7),
                    borderRadius: '50%',
                    backgroundColor: colors['neutral-gray'][300],
                  },
                }}
              >
                {link(data.legalUrls.privacy, labels['privacy-policy'], false, 'sitemap-footer-link')}
              </Box>
            )}
            {data.footerLegals.legal && (
              <Box
                as="li"
                position="relative"
                mb={4}
                pl={7}
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '0.65em',
                    left: 0,
                    width: pxToRem(7),
                    height: pxToRem(7),
                    borderRadius: '50%',
                    backgroundColor: colors['neutral-gray'][300],
                  },
                }}
              >
                {link(data.legalUrls.legal, labels['legal-mentions'], false, 'sitemap-footer-link')}
              </Box>
            )}
            {data.footerLinks
              .filter(item => item.name?.trim())
              .map((item, index) => (
                <Box
                  as="li"
                  key={`${item.url}-${index}`}
                  position="relative"
                  mb={4}
                  pl={7}
                  sx={{
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '0.65em',
                      left: 0,
                      width: pxToRem(7),
                      height: pxToRem(7),
                      borderRadius: '50%',
                      backgroundColor: colors['neutral-gray'][300],
                    },
                  }}
                >
                  {link(item.url, item.name, item.isExternalLink, 'sitemap-footer-link', item.url === sitemapUrl)}
                  {item.url === sitemapUrl && (
                    <Box
                      as="span"
                      className="sitemap-current-page"
                      display="inline-block"
                      ml={pxToRem(6)}
                      px={pxToRem(7)}
                      py={0.5}
                      border={`${pxToRem(1)} solid`}
                      borderColor="neutral-gray.200"
                      borderRadius={pxToRem(12)}
                      color="white"
                      fontSize="0.75em"
                      fontWeight={400}
                      lineHeight={1.2}
                      verticalAlign="middle"
                      sx={{
                        background: `linear-gradient(90deg, ${siteColors.linkColor}, ${
                          siteColors.linkHoverColor || siteColors.linkColor
                        })`,
                      }}
                    >
                      {labels['sitemap.current-page']}
                    </Box>
                  )}
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function Sitemap() {
  return (
    <Suspense fallback={<Spinner m="auto" my="10rem" />}>
      <SitemapContent />
    </Suspense>
  )
}
