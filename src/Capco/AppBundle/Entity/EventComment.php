<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class EventComment.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventCommentRepository")
 */
class EventComment extends Comment
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $Event;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return mixed
     */
    public function getEvent()
    {
        return $this->Event;
    }

    /**
     * @param $Event
     *
     * @return $this
     */
    public function setEvent($Event)
    {
        $this->Event = $Event;
        $Event->addComment($this);

        return $this;
    }

    // ************************ Overriden methods *********************************

    public function getRelatedObject()
    {
        return $this->getEvent();
    }

    /**
     * @param $object
     *
     * @return mixed
     */
    public function setRelatedObject($object)
    {
        return $this->setEvent($object);
    }
}
