<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisLogItem;
use Capco\UserBundle\Entity\User;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\SynthesisElementChangedEvent;

class SynthesisSubscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::SYNTHESIS_ELEMENT_CHANGED => 'onSynthesisElementChanged',
        ];
    }

    public function onSynthesisElementChanged(SynthesisElementChangedEvent $event)
    {
        $element = $event->getElement();
        $author = $event->getAuthor();
        $action = $event->getAction();
        $previousState = $event->getPreviousState();

        if ($action === 'updated' && $previousState !== null) {

            // Move
            if ($element->getParent() != $previousState->getParent()) {
                $this->logAction($element, $author, 'moved');
            }

            // Publish / Unpublish
            if ($element->isEnabled() !== $previousState->isEnabled()) {
                if ($element->isEnabled() === true) {
                    $this->logAction($element, $author, 'published');
                } else {
                    $this->logAction($element, $author, 'unpublished');
                }
            }

            // Archive
            if ($element->isArchived() !== $previousState->isArchived() && $element->isArchived()) {
                $this->logAction($element, $author, 'archived');
            }

            // Note
            if ($element->getNotation() !== $previousState->getNotation()) {
                $this->logAction($element, $author, 'noted');
            }

            // Update
            if ($element->getTitle() !== $previousState->getTitle() || $element->getBody() !== $previousState->getBody()) {
                $this->logAction($element, $author, 'updated');
            }

        }
        else {
            $this->logAction($element, $author, $action);
        }
    }

    public function logAction(SynthesisElement $element, User $author, $action) {
        $log = new SynthesisLogItem($element, $author, $action);
        $this->em->persist($log);
        $this->em->flush();
    }
}
