<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Event;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventCommentRepository")
 */
class EventComment extends Comment
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $Event;

    public function __construct()
    {
        parent::__construct();
    }

    public function getEvent(): ?Event
    {
        return $this->Event;
    }

    public function setEvent(Event $Event): self
    {
        $this->Event = $Event;
        $Event->addComment($this);

        return $this;
    }

    public function isCommentable(): bool
    {
        return true;
    }

    public function acceptNewComments(): bool
    {
        return $this->isPublished() && !$this->isTrashed();
    }

    public function getRelatedObject(): ?Event
    {
        return $this->getEvent();
    }

    public function getKind(): string
    {
        return 'eventComment';
    }

    public function setRelatedObject($object)
    {
        return $this->setEvent($object);
    }
}
