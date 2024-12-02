<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\District\GlobalDistrictRefererMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Twig\SiteImageRuntime;
use Symfony\Component\Routing\RouterInterface;

class GlobalDistrictFollowerNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        protected UserUrlResolver $userUrlResolver,
        LocaleResolver $localeResolver,
        private readonly UrlResolver $urlResolver,
        private readonly MediaUrlResolver $mediaUrlResolver,
        private readonly SiteImageRuntime $siteImageRuntime
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onNewProjectInDistrict(GlobalDistrict $district, Project $project)
    {
        $followers = $district->getFollowers();
        foreach ($followers as $follower) {
            $this->mailer->createAndSendMessage(
                GlobalDistrictRefererMessage::class,
                $project,
                [
                    'logoUrl' => $this->siteImageRuntime->getAppLogoUrl(),
                    'zoneGeoTitle' => $district->getName(),
                    'projectsURL' => $this->urlResolver->getObjectUrl($project),
                    'projectThumb' => $project->getCover()
                        ? $this->mediaUrlResolver->__invoke($project->getCover())
                        : null,
                    'projectTitle' => $project->getTitle(),
                    'siteName' => $this->siteName,
                    'baseUrl' => $this->baseUrl,
                    'siteUrl' => $this->siteUrl,
                ],
                $follower->getUser()
            );
        }
    }
}
