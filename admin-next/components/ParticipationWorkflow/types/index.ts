// Simplified GlobalState type for ParticipationWorkflow components
export type GlobalState = {
  user: {
    user: Record<string, any> | null
  }
  default: {
    parameters: Record<string, string>
    ssoList: any[]
  }
}
