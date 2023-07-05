<?php

namespace Capco\AdminBundle\EventListener;

use Capco\AdminBundle\Block\LocaleSwitcherBlockService;
use Capco\AppBundle\Toggle\Manager;
use Sonata\BlockBundle\Event\BlockEvent;
use Sonata\BlockBundle\Model\Block;

class LocaleSwitcherListener
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function onBlock(BlockEvent $event, $eventName)
    {
        // We hide locale switcher when multilangue is disabled
        if (!$this->toggleManager->isActive('multilangue')) {
            return;
        }

        // We hide locale switcher from list view
        if ('sonata.block.event.sonata.admin.list.table.top' === $eventName) {
            return;
        }

        $settings = $event->getSettings();
        if ('sonata.block.event.sonata.admin.show.top' === $eventName) {
            $settings['locale_switcher_route'] = 'show';
        }

        $block = new Block();
        $block->setSettings($settings);
        $block->setName(LocaleSwitcherBlockService::class);
        $block->setType(LocaleSwitcherBlockService::class);

        $event->addBlock($block);
    }
}
