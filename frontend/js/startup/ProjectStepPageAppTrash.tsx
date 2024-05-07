import React from 'react'

import ProjectTrashButton from '~/components/Project/ProjectTrashButton'

export const ProjectTrash = ({
  showTrash,
  projectSlug,
  unstable__enableCapcoUiDs,
}: {
  showTrash: boolean
  projectSlug: string
  unstable__enableCapcoUiDs?: boolean
}) =>
  showTrash ? (
    <section className="hidden-print">
      <ProjectTrashButton
        link={`/projects/${projectSlug}/trashed`}
        unstable__enableCapcoUiDs={unstable__enableCapcoUiDs}
      />
    </section>
  ) : null
