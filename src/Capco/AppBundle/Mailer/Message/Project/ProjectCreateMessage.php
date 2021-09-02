<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProjectCreateMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email-subject-project-create';
    public const TEMPLATE = 'email-content-project-create';

    public static function getMyTemplateVars(Project $project, array $params): array
    {
        return [
            '{username}' => $project->getAuthor()->getUsername(),
            '{sitename}' => $params['siteName'],
            '{editUrl}' => $params['editURL'],
            '{projectsUrl}' => $params['projectsURL'],
        ];
    }

    public static function getMySubjectVars(Project $project, array $params): array
    {
        return [
            '{sitename}' => $params['siteName'],
        ];
    }
}
