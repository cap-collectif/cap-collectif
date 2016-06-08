<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\Helper\ProjectHelper;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializationContext;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

class ProjectSerializationListener extends AbstractSerializationListener
{
    private $stepResolver;
    private $mediaExtension;
    private $serializer;
    private $helper;

    public function __construct(StepResolver $stepResolver, MediaExtension $mediaExtension, Serializer $serializer, ProjectHelper $helper)
    {
        $this->stepResolver = $stepResolver;
        $this->mediaExtension = $mediaExtension;
        $this->serializer = $serializer;
        $this->helper = $helper;
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
        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->stepResolver->getFirstStepLinkForProject($project),
            ]
        );

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
        $context->setGroups(['Steps']);
        $steps = $this->serializer->serialize($abstractSteps, 'json', $context);

        $event->getVisitor()->addData(
            'steps',
            json_decode($steps, true)
        );
    }
}
