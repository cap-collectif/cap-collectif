import { CapUIIcon } from '@cap-collectif/ui'

// Converts GraphQL VoteButtonIcon enum value (SCREAMING_SNAKE_CASE) to the matching CapUIIcon key (PascalCase)
export const getVoteButtonIcon = (icon: string | null | undefined): CapUIIcon => {
  if (!icon) return CapUIIcon.ThumbUp
  const pascalCase = icon
    .split('_')
    .map(w => w[0] + w.slice(1).toLowerCase())
    .join('')
  return (CapUIIcon as Record<string, CapUIIcon>)[pascalCase] ?? CapUIIcon.ThumbUp
}

export default getVoteButtonIcon
