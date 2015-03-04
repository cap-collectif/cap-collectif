<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class EventComment
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventCommentRepository")
 * @package Capco\AppBundle\Entity
 */
class EventComment extends AbstractComment
{

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Event = null;

    function __construct()
    {
        parent::__construct();
        $this->Event = null;
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
     * @return $this
     */
    public function setEvent($Event)
    {
        $this->Event = $Event;
        $Event->addComment($this);
        return $this;
    }

    // ************************ Overriden methods *********************************

    /**
     * @return null
     */
    public function getRelatedObject()
    {
        return $this->getEvent();
    }

    /**
     * @param $object
     * @return mixed
     */
    public function setRelatedObject($object)
    {
        return $this->setEvent($object);
    }

}
