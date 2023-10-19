import AddDebateArgumentMutation from '~/mutations/AddDebateArgumentMutation'
import AddDebateVoteMutation from '~/mutations/AddDebateVoteMutation'
type ActionType = 'DEBATE_ARGUMENT'
type Action = {
  readonly action: ActionType
  debate: string
  body: string
  type: 'FOR' | 'AGAINST'
  widgetOriginURI?: string | null | undefined
}
export const userActions = (onSuccessAction: string) => {
  const action: Action = JSON.parse(onSuccessAction)

  if (action.action === 'DEBATE_ARGUMENT') {
    const { debate, body, type, widgetOriginURI } = action
    AddDebateVoteMutation.commit(
      {
        input: {
          debateId: debate,
          type,
          widgetOriginURI,
        },
      },
      {
        yesVotes: 0,
        votes: 0,
        viewerConfirmed: true,
      },
    )
      .then(res => {
        if (!res.addDebateVote?.errorCode) {
          return AddDebateArgumentMutation.commit({
            input: {
              debate,
              body,
              type,
              widgetOriginURI,
            },
            connections: [],
            edgeTypeName: 'DebateArgumentEdge',
          })
            .then(r => {
              if (r.createDebateArgument?.errorCode) {
                console.error('Error')
              }

              window.location.reload()
            })
            .catch(() => {
              console.error('Error')
            })
        }
      })
      .catch(() => {
        console.error('Error')
      })
  }
}
