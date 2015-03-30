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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\AbstractComment", inversedBy="votes", cascade={"persist"})
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
    public function setComment(AbstractComment $comment)
    {
        if (null != $comment) {
            $this->comment = $comment;
            $comment->addVote($this);
        }

        return $this;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->comment != null) {
            $this->comment->removeVote($this);
        }
    }
}
