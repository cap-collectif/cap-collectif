import React from 'react'

import ProjectTrashButton from '~/components/Project/ProjectTrashButton'

export const ProjectTrash = ({ showTrash, projectSlug }: { showTrash: boolean; projectSlug: string }) =>
  showTrash ? (
    <section className="hidden-print">
      <ProjectTrashButton link={`/projects/${projectSlug}/trashed`} />
    </section>
  ) : null
