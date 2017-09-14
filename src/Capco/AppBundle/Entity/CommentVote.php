<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * CommentVote.
 *
 * @ORM\Entity()
 * @ORM\HasLifecycleCallbacks()
 */
class CommentVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Comment", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="comment_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $comment;

    /**
     * @return mixed
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * @param $comment
     *
     * @return $this
     */
    public function setComment(Comment $comment)
    {
        if (null !== $comment) {
            $this->comment = $comment;
            $comment->addVote($this);
        }

        return $this;
    }

    public function getRelatedEntity()
    {
        return $this->comment;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->comment !== null) {
            $this->comment->removeVote($this);
        }
    }
}
