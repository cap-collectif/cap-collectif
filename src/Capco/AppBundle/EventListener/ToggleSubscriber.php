<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Event\ToggleFeatureEvent;
use Doctrine\ORM\EntityManagerInterface;
use Qandidate\Toggle\Toggle;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ToggleSubscriber implements EventSubscriberInterface
{

    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ToggleFeatureEvent::NAME => 'onFeatureToggle',
        ];
    }

    public function onFeatureToggle(ToggleFeatureEvent $event)
    {
        $toggle = $event->getToggle();
        if ('unstable__new_project_card' === $toggle->getName()) {
            $status = $toggle->getStatus();
            $maxProjects = null;
            if (Toggle::ALWAYS_ACTIVE === $status) {
                $maxProjects = 9;
            } elseif (Toggle::INACTIVE === $status) {
                $maxProjects = 8;
            }
            $section = $this->em->getRepository(Section::class)->findOneBy(['type' => 'projects']);
            if ($section->getNbObjects() > $maxProjects) {
                $section->setNbObjects($maxProjects);
                $this->em->persist($section);
                $this->em->flush();
            }
        }
    }
}
