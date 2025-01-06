<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\Comment;
use Symfony\Contracts\EventDispatcher\Event;

class CommentChangedEvent extends Event
{
    protected $comment;

    public function __construct(Comment $comment, protected $action)
    {
        $this->comment = $comment;
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
