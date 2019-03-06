<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Doctrine\ORM\Mapping as ORM;

trait CommentableWithoutCounterTrait
{
    /**
     * @var bool
     *
     * @ORM\Column(name="is_commentable", type="boolean")
     */
    private $commentable = true;

    /**
     * @return mixed
     */
    public function getComments()
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): self
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        $this->comments->removeElement($comment);

        return $this;
    }

    public function isCommentable(): bool
    {
        return $this->commentable ?? false;
    }

    public function setCommentable(bool $commentable): self
    {
        $this->commentable = $commentable;

        return $this;
    }

    public function acceptNewComments($user = null): bool
    {
        if (!$this instanceof Event && !$this instanceof Post) {
            return $this->canContribute($user) && $this->isCommentable();
        }

        return $this->canContribute() && $this->isCommentable();
    }
}
