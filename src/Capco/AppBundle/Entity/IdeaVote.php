<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * IdeaVote.
 *
 * @CapcoAssert\DidNotAlreadyVoteEmail()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser()
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class IdeaVote extends AbstractVote
{
    use \Capco\AppBundle\Traits\AnonymousableTrait;
    use \Capco\AppBundle\Traits\PrivatableTrait;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $idea;

    /**
     * Constructor.
     */
    public function __construct(Idea $idea = null)
    {
        parent::__construct();

        $this->idea = $idea;
        $this->setConfirmed(false);
    }

    public function __toString()
    {
        if ($this->idea) {
            return 'Vote on '.$this->idea;
        }

        return 'New idea vote';
    }

    /**
     * set idea.
     *
     * @param $Idea
     *
     * @return IdeaVote
     */
    public function setIdea($idea)
    {
        $this->idea = $idea;
        $this->idea->addVote($this);

        return $this;
    }

    public function getIdea()
    {
        return $this->idea;
    }

    public function getRelatedEntity()
    {
        return $this->idea;
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->idea != null) {
            $this->idea->removeVote($this);
        }
    }
}
