<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Enum\SSOType;
use Capco\AppBundle\Event\ToggleFeatureEvent;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Qandidate\Toggle\Toggle;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ToggleSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly AbstractSSOConfigurationRepository $SSOConfigurationRepository, private readonly SectionRepository $sectionRepository)
    {
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
        if (Manager::new_project_card === $toggle->getName()) {
            $status = $toggle->getStatus();
            $maxProjects = null;
            if (Toggle::ALWAYS_ACTIVE === $status) {
                $maxProjects = 9;
            } elseif (Toggle::INACTIVE === $status) {
                $maxProjects = 8;
            }
            $section = $this->sectionRepository->findOneBy(['type' => 'projects']);
            if ($section->getNbObjects() > $maxProjects) {
                $section->setNbObjects($maxProjects);
                $this->em->persist($section);
                $this->em->flush();
            }
        }
        if (Manager::oauth2_switch_user === $toggle->getName()) {
            $status = $toggle->getStatus();
            if (Toggle::ALWAYS_ACTIVE !== $status) {
                return;
            }

            $openIdConfig = $this->SSOConfigurationRepository->findOneByType(SSOType::OAUTH2);

            if (!$openIdConfig) {
                return;
            }

            $openIdConfig->setDisconnectSsoOnLogout(true);
            $this->em->flush();
        }
    }
}
