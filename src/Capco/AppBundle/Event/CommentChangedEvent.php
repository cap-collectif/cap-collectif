<?php

namespace Capco\AppBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Capco\AppBundle\Entity\Comment;

class CommentChangedEvent extends Event
{
    protected $comment;
    protected $action;

    public function __construct(Comment $comment, $action)
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
