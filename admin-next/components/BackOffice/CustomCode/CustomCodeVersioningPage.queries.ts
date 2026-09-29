import { graphql } from 'react-relay'

export const QUERY = graphql`
  query CustomCodeVersioningPageQuery($versionsFirst: Int!) {
    customCodeConfiguration {
      id
      keyname
      label
      description
      activeContent
      activeContentHash
      hasMoreVersions
      versionsCount
      versionsConnection(first: $versionsFirst) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            keyname
            title
            authorName
            description
            referenceUrl
            type
            createdAt
            contentHash
            previousContentHash
          }
        }
      }
    }
  }
`

export const COMMIT_MUTATION = graphql`
  mutation CustomCodeVersioningPageCommitMutation($input: CommitCustomCodeVersionInput!, $versionsFirst: Int!) {
    commitCustomCodeVersion(input: $input) {
      errorCode
      customCode {
        id
        keyname
        label
        description
        activeContent
        activeContentHash
        hasMoreVersions
        versionsCount
        versionsConnection(first: $versionsFirst) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              keyname
              title
              authorName
              description
              referenceUrl
              type
              createdAt
              contentHash
              previousContentHash
            }
          }
        }
      }
    }
  }
`

export const RESTORE_MUTATION = graphql`
  mutation CustomCodeVersioningPageRestoreMutation($input: RestoreCustomCodeVersionInput!, $versionsFirst: Int!) {
    restoreCustomCodeVersion(input: $input) {
      errorCode
      customCode {
        id
        keyname
        label
        description
        activeContent
        activeContentHash
        hasMoreVersions
        versionsCount
        versionsConnection(first: $versionsFirst) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              keyname
              title
              authorName
              description
              referenceUrl
              type
              createdAt
              contentHash
              previousContentHash
            }
          }
        }
      }
    }
  }
`

export const CUSTOM_CODE_VERSIONS_QUERY = graphql`
  query CustomCodeVersioningPageVersionsQuery($keyname: String!, $offset: Int!, $limit: Int!) {
    customCodeVersions(keyname: $keyname, offset: $offset, limit: $limit) {
      id
      keyname
      title
      authorName
      description
      referenceUrl
      type
      createdAt
      contentHash
      previousContentHash
    }
  }
`

export const CUSTOM_CODE_VERSION_QUERY = graphql`
  query CustomCodeVersioningPageVersionQuery($id: ID!) {
    customCodeVersion(id: $id) {
      id
      title
      description
      content
    }
  }
`

export const CUSTOM_CODE_DIFF_VERSION_QUERY = graphql`
  query CustomCodeVersioningPageDiffVersionQuery($id: ID!) {
    customCodeVersion(id: $id) {
      id
      title
      description
      content
    }
  }
`
