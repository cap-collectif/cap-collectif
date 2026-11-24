import * as React from 'react'
import { useIntl } from 'react-intl'

const VoteStepResultsAnnouncerContext = React.createContext<(resultsCount: number) => void>(() => {})

export const useAnnounceResults = () => React.useContext(VoteStepResultsAnnouncerContext)

/**
 * Announces the number of results to screen readers after a search, a filter or a sort (WCAG 4.1.3).
 * Render it above the list Suspense boundaries: a live region must stay mounted to be announced.
 */
export const VoteStepResultsAnnouncer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intl = useIntl()
  const [message, setMessage] = React.useState('')
  const isInitialResults = React.useRef(true)

  const announce = React.useCallback(
    (resultsCount: number) => {
      // The results displayed on page load are not announced, only their updates
      if (isInitialResults.current) {
        isInitialResults.current = false
        return
      }
      const nextMessage = intl.formatMessage({ id: 'search-results-count' }, { count: resultsCount })
      // A repeated message must still change the content to be announced again
      setMessage(previous => (previous === nextMessage ? `${nextMessage} ` : nextMessage))
    },
    [intl],
  )

  return (
    <VoteStepResultsAnnouncerContext.Provider value={announce}>
      {children}
      <p role="status" className="sr-only">
        {message}
      </p>
    </VoteStepResultsAnnouncerContext.Provider>
  )
}

export default VoteStepResultsAnnouncer
