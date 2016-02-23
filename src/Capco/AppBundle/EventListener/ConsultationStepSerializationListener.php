<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\ContributionResolver;
use Capco\AppBundle\Resolver\ProposalVotesResolver;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ConsultationStepSerializationListener extends AbstractSerializationListener
{
    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\ConsultationStep',
                'method' => 'onPostConsultationStep',
            ],
        ];
    }

    public function onPostConsultationStep(ObjectEvent $event)
    {
        $step = $event->getObject();

        $event->getVisitor()->addData(
            'counters', [
                'contributions' => $step->getContributionsCount(),
                'votes' => $step->getVotesCount(),
                'contributors' => $step->getContributorsCount(),
                'remainingDays' => intval($step->getRemainingDays()),
            ]
        );
    }
}
