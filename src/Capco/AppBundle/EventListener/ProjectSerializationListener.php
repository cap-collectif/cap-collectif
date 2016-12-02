<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\Helper\ProjectHelper;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializationContext;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\Router;

class ProjectSerializationListener extends AbstractSerializationListener
{
    private $stepResolver;
    private $mediaExtension;
    private $serializer;
    private $helper;
    private $router;

    public function __construct(
      StepResolver $stepResolver,
      MediaExtension $mediaExtension,
      Serializer $serializer,
      ProjectHelper $helper,
      Router $router
      ) {
        $this->stepResolver = $stepResolver;
        $this->mediaExtension = $mediaExtension;
        $this->serializer = $serializer;
        $this->helper = $helper;
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Project',
                'method' => 'onPostProject',
            ],
        ];
    }

    public function onPostProject(ObjectEvent $event)
    {
        $project = $event->getObject();
        $links = [
          'show' => $this->stepResolver->getFirstStepLinkForProject($project),
          'external' => $project->getExternalLink(),
        ];

        if ($this->eventHasGroup($event, 'ProjectAdmin')) {
            $links['admin'] = $this->router->generate('admin_capco_app_project_edit', ['id' => $project->getId()]);
        }

        $event->getVisitor()->addData('_links', $links);

        if ($this->eventHasGroup($event, 'Projects')) {
            if ($project->getCover()) {
                try {
                    $event->getVisitor()->addData(
                      'cover', [
                          'url' => $this->mediaExtension->path($project->getCover(), 'project'),
                          ]
                        );
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
