<?php

namespace Capco\AdminBundle\EventListener;

use Capco\AdminBundle\Block\LocaleSwitcherBlockService;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\BlockBundle\Model\Block;
use Sonata\BlockBundle\Event\BlockEvent;

class LocaleSwitcherListener
{
    private $toggleManager;
    private $entityManager;

    public function __construct(Manager $toggleManager, EntityManagerInterface $entityManager)
    {
        $this->toggleManager = $toggleManager;
        $this->entityManager = $entityManager;
    }

    public function onBlock(BlockEvent $event, $eventName)
    {
        if (!$this->toggleManager->isActive('unstable__multilangue')) {
            return;
        }

        $availableLocales = $this->entityManager
            ->getRepository(Locale::class)
            ->findEnabledLocales();

        // We hide locale switcher from list view
        if ('sonata.block.event.sonata.admin.list.table.top' === $eventName) {
            return;
        }

        $settings = $event->getSettings();
        if ('sonata.block.event.sonata.admin.show.top' === $eventName) {
            $settings['locale_switcher_route'] = 'show';
        }
        if ('sonata.block.event.sonata.admin.list.table.top' === $eventName) {
            $settings['locale_switcher_route'] = 'list';

            return;
        }
        $settings['available_locales'] = $availableLocales;

        $block = new Block();
        $block->setSettings($settings);
        $block->setName(LocaleSwitcherBlockService::class);
        $block->setType(LocaleSwitcherBlockService::class);

        $event->addBlock($block);
    }
}
