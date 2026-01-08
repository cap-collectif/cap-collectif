<?php

declare(strict_types=1);

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Antivirus\ClamdManager;
use Capco\AppBundle\Event\ToggleFeatureEvent;
use Capco\AppBundle\Toggle\Manager;
use Qandidate\Toggle\Toggle;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AntivirusToggleSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ClamdManager $clamdManager,
        private readonly string $environment
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ToggleFeatureEvent::NAME => 'onToggleFeature',
        ];
    }

    public function onToggleFeature(ToggleFeatureEvent $event): void
    {
        if ('test' === $this->environment) {
            return;
        }

        $toggle = $event->getToggle();

        if (Manager::antivirus !== $toggle->getName()) {
            return;
        }

        if (Toggle::ALWAYS_ACTIVE === $toggle->getStatus()) {
            $this->clamdManager->start();
        } else {
            $this->clamdManager->stop();
        }
    }
}
