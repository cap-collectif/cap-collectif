<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Event\ToggleFeatureEvent;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Qandidate\Toggle\Toggle;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class NewBackOfficeToggleEventSubscriber implements EventSubscriberInterface
{
    private readonly EntityManagerInterface $em;

    public function __construct(
        EntityManagerInterface $em
    ) {
        $this->em = $em;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ToggleFeatureEvent::NAME => 'onToggle',
        ];
    }

    public function onToggle(ToggleFeatureEvent $event): void
    {
        $toggle = $event->getToggle();
        $status = $toggle->getStatus();

        if (Manager::unstable__new_create_project !== $toggle->getName()) {
            return;
        }

        if (Toggle::ALWAYS_ACTIVE === $status) {
            $connection = $this->em->getConnection();
            $sql = <<<'SQL'
                                update step set start_at = null, end_at = null, step_type = 'other', timeless = 1 where id in (
                                select s.id
                                from step s
                                join project_abstractstep pas on s.id = pas.step_id
                                where s.step_type = 'presentation' and pas.position > 1)
                SQL;
            $connection->executeStatement($sql);
        }
    }
}
