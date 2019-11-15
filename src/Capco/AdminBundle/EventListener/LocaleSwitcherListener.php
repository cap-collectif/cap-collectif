<?php

namespace Capco\AdminBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Sonata\BlockBundle\Model\Block;
use Sonata\BlockBundle\Event\BlockEvent;

class LocaleSwitcherListener
{
    private $toggleManager;

    public function __construct(
        Manager $toggleManager
    ) {
        $this->toggleManager = $toggleManager;
    }

    public function onBlock(BlockEvent $event, $eventName)
    {
        if (!$this->toggleManager->isActive('unstable__multilangue')) {
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
        if ('sonata.block.event.sonata.admin.list.table.top' === $eventName) {
            $settings['locale_switcher_route'] = 'list';
            return;
        }

        $block = new Block();
        $block->setSettings($settings);
        $block->setName('sonata_translation.block.locale_switcher');
        $block->setType('sonata_translation.block.locale_switcher');

        $event->addBlock($block);
    }
}
