<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProjectCreateMessage extends ExternalMessage
{
    public static function create(
        Project $project,
        string $sitename,
        string $projectAdminEditUrl,
        string $projectsUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-project-create',
            static::getMySubjectVars(
                $sitename
            ),
            'email-content-project-create',
            static::getMyTemplateVars(
                $project->getAuthor()->getUsername(),
                $sitename,
                $projectAdminEditUrl,
                $projectsUrl
            )
        );
    }

    private static function getMySubjectVars(
        $sitename
    ): array {
        return [
            '{sitename}' => $sitename,
        ];
    }

    private static function getMyTemplateVars(
        $username,
        $sitename,
        $editUrl,
        $projectsUrl
    ): array {
        return [
            '{username}' => $username,
            '{sitename}' => $sitename,
            '{editUrl}' => $editUrl,
            '{projectsUrl}' => $projectsUrl,
        ];
    }
}
