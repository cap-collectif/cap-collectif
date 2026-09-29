import { ConnectionHandler, ROOT_ID } from 'relay-runtime'

export const CONNECTION_NODES_PER_PAGE = 50

export const CONNECTION_KEY = 'NewsletterSubscriptionList_newsletterSubscriptions'

export const getConnectionId = (search: string | null): string =>
  ConnectionHandler.getConnectionID(ROOT_ID, CONNECTION_KEY, { search })
