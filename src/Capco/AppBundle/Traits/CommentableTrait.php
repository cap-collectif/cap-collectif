<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Comment;
use Doctrine\ORM\Mapping as ORM;

trait CommentableTrait
{
    /**
     * @var int
     *
     * @ORM\Column(name="comments_count", type="integer")
     */
    private $commentsCount = 0;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_commentable", type="boolean")
     */
    private $isCommentable = true;

    public function increaseCommentsCount($nb)
    {
        $this->commentsCount += $nb;
    }

    public function decreaseCommentsCount($nb)
    {
        if ($this->commentsCount >= $nb) {
            $this->commentsCount -= $nb;
        }
    }

    /**
     * @return int
     */
    public function getCommentsCount()
    {
        return $this->commentsCount;
    }

    /**
     * @param int $commentsCount
     */
    public function setCommentsCount($commentsCount)
    {
        $this->commentsCount = $commentsCount;
    }

    /**
     * @return mixed
     */
    public function getComments()
    {
        return $this->comments;
    }

    /**
     * @param $comment
     *
     * @return $this
     */
    public function addComment(Comment $comment)
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
        }

        return $this;
    }

    /**
     * @param $comment
     *
     * @return $this
     */
    public function removeComment(Comment $comment)
    {
        $this->comments->removeElement($comment);

        return $this;
    }

    /**
     * @return bool
     */
    public function getIsCommentable(): bool
    {
        return $this->isCommentable ?? false;
    }

    /**
     * @param bool $isCommentable
     */
    public function setIsCommentable($isCommentable)
    {
        $this->isCommentable = $isCommentable;
    }

    /**
     * @return bool
     */
    public function canComment()
    {
        return $this->canContribute() && $this->isCommentable;
    }
}
