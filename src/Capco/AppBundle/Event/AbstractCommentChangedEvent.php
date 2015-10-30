<?php

namespace Capco\AppBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Capco\AppBundle\Entity\AbstractComment;

class AbstractCommentChangedEvent extends Event
{
    protected $comment;
    protected $action;

    public function __construct(AbstractComment $comment, $action)
    {
        $this->comment = $comment;
        $this->action = $action;
    }

    public function getComment()
    {
        return $this->comment;
    }

    public function getAction()
    {
        return $this->action;
    }
}
