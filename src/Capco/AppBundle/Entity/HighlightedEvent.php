<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedEvent.
 *
 * @ORM\Entity()
 */
class HighlightedEvent extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Event")
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $event;

    /**
     * Gets the value of event.
     *
     * @return mixed
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * Sets the value of event.
     *
     * @param mixed $event the event
     *
     * @return self
     */
    public function setEvent(Event $event)
    {
        $this->event = $event;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return ['calendar'];
    }

    public function getContent()
    {
        return $this->event;
    }

    public function getType()
    {
        return 'event';
    }

    public function getMedia()
    {
        return $this->event->getMedia();
    }
}
