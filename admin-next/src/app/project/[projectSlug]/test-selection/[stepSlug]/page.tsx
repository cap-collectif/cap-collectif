import { Metadata } from 'next'
import { getCollectAndSelectionStepPage, getCollectAndSelectionStepPageMetadata } from '../../test-collect/[stepSlug]/page'

type Params = { params: { stepSlug: string; projectSlug: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return getCollectAndSelectionStepPageMetadata({ params })
}

export default async function Page({ params }: Params) {
  return getCollectAndSelectionStepPage({ params })
}
