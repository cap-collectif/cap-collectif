<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\ProjectCreateMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\ProjectResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

final class ProjectNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        private readonly ProjectResolver $projectResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onCreate(Project $project)
    {
        $this->mailer->createAndSendMessage(
            ProjectCreateMessage::class,
            $project,
            [
                'editURL' => $this->projectResolver->resolveAdminEditUrl($project),
                'projectsURL' => $this->projectResolver->resolveIndexUrl(),
            ],
            $project->getAuthor()
        );
    }
}
