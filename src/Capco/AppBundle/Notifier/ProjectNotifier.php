<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\ProjectCreateMessage;
use Capco\AppBundle\Resolver\ProjectResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

final class ProjectNotifier extends BaseNotifier
{
    private $projectResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        ProjectResolver $projectResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $router);
        $this->projectResolver = $projectResolver;
    }

    public function onCreate(Project $project)
    {
        $this->mailer->sendMessage(
            ProjectCreateMessage::create(
                $project,
                $this->siteParams->getValue('global.site.fullname'),
                $this->projectResolver->resolveAdminEditUrl($project),
                $this->projectResolver->resolveIndexUrl(),
                $project->getAuthor()->getEmail()
            )
        );
    }
}
