<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

use Capco\AppBundle\Traits\ConfirmableTrait;

/**
 * ArgumentVote
 *
 * @CapcoAssert\DidNotAlreadyVoteEmail()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser()
 * @ORM\Table(name="idea_vote")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class IdeaVote
{
    use \Capco\AppBundle\Traits\ConfirmableTrait;
    use \Capco\AppBundle\Traits\AnonymousableTrait;
    use \Capco\AppBundle\Traits\PrivatableTrait;

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="votes", cascade={"persist"})
     */
    private $idea;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $user;

    public function __toString()
    {
        if ($this->idea && $this->user) {
            return $this->getUser()." - ".$this->getIdea();
        }

        return "New idea vote";
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get idea
     *
     * @return \Capco\AppBundle\Entity\Idea
     */
    public function getIdea()
    {
        return $this->idea;
    }

    /**
     * set idea
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

    /**
     * Set user
     *
     * @param \Capco\UserBundle\Entity\User $user
     *
     * @return IdeaVote
     */
    public function setUser(\Capco\UserBundle\Entity\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \Capco\UserBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
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
