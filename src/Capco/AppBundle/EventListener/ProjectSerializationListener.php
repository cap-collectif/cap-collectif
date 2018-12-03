<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\Serializer;
use Capco\AppBundle\Entity\Project;
use Symfony\Component\Routing\Router;
use JMS\Serializer\SerializationContext;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Resolver\StepResolver;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Capco\AppBundle\Resolver\ContributionResolver;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

class ProjectSerializationListener extends AbstractSerializationListener
{
    private $stepResolver;
    private $mediaExtension;
    private $serializer;
    private $helper;
    private $router;
    private $contributionResolver;

    public function __construct(
        StepResolver $stepResolver,
        MediaExtension $mediaExtension,
        Serializer $serializer,
        ProjectHelper $helper,
        ContributionResolver $contributionResolver,
        Router $router
    ) {
        $this->stepResolver = $stepResolver;
        $this->mediaExtension = $mediaExtension;
        $this->serializer = $serializer;
        $this->helper = $helper;
        $this->router = $router;
        $this->contributionResolver = $contributionResolver;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => Project::class,
                'method' => 'onPostProject',
            ],
        ];
    }

    public function onPostProject(ObjectEvent $event)
    {
        $project = $event->getObject();
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            $event->getVisitor()->addData('projectStatus', $project->getCurrentStepStatus());
            $event
                ->getVisitor()
                ->addData(
                    'contributionCount',
                    $this->contributionResolver->countProjectContributions($project)
                );

            return;
        }

        $links = [
            'show' => $this->stepResolver->getFirstStepLinkForProject($project),
            'external' => $project->getExternalLink(),
        ];

        if ($this->eventHasGroup($event, 'ProjectAdmin')) {
            $links['admin'] = $this->router->generate(
                'admin_capco_app_project_edit',
                ['id' => $project->getId()],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        $event->getVisitor()->addData('_links', $links);

        if ($this->eventHasGroup($event, 'Projects')) {
            if ($project->getCover()) {
                try {
                    $event->getVisitor()->addData('cover', [
                        'url' => $this->mediaExtension->path($project->getCover(), 'project'),
                    ]);
                } catch (RouteNotFoundException $e) {
                    // Avoid some SonataMedia problems
                }
            }

            $abstractSteps = $this->helper->getAbstractSteps($project);

            $context = new SerializationContext();
            $context->setGroups(['Steps', 'StepTypes']);
            $steps = $this->serializer->serialize($abstractSteps, 'json', $context);

            $event->getVisitor()->addData('steps', json_decode($steps, true));
        }
    }
}
