<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\StepResolver;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;

class ProjectSerializationListener extends AbstractSerializationListener
{
    private $stepResolver;
    private $mediaExtension;

    public function __construct(StepResolver $stepResolver, MediaExtension $mediaExtension)
    {
        $this->stepResolver = $stepResolver;
        $this->mediaExtension = $mediaExtension;
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
    }
}
