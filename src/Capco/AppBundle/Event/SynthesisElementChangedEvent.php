<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\UserBundle\Entity\User;
use Symfony\Component\EventDispatcher\Event;

class SynthesisElementChangedEvent extends Event
{

    private $element;
    private $previousState;
    private $author;
    private $action;
    private $datetime;

    public function __construct(SynthesisElement $element, User $author, $action, SynthesisElement $previousState = null)
    {
        $this->element = $element;
        $this->previousState = $previousState;
        $this->author = $author;
        $this->action = $action;
        $this->datetime = new \DateTime();
    }

    /**
     * @return SynthesisElement
     */
    public function getElement()
    {
        return $this->element;
    }

    /**
     * @return SynthesisElement
     */
    public function getPreviousState()
    {
        return $this->previousState;
    }

    /**
     * @return User
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @return mixed
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * @return \DateTime
     */
    public function getDatetime()
    {
        return $this->datetime;
    }
}
