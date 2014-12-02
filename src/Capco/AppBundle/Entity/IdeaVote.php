<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ArgumentVote
 *
 * @ORM\Table(name="idea_vote")
 * @ORM\Entity
 */
class IdeaVote
{
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="IdeaVotes")
     */
    private $Idea;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id")
     */
    private $Voter;

    public function __toString()
    {
        if ($this->id) {
            return $this->getId();
        } else {
            return "New idea vote";
        }
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
     * @return mixed
     */
    public function getIdea()
    {
        return $this->idea;
    }

    /**
     * @param mixed $idea
     */
    public function setIdea($idea)
    {
        $this->idea = $idea;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return IdeaVote
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Set voter
     *
     * @param \Capco\UserBundle\Entity\User $voter
     *
     * @return IdeaVote
     */
    public function setVoter(\Capco\UserBundle\Entity\User $voter = null)
    {
        $this->Voter = $voter;

        return $this;
    }

    /**
     * Get voter
     *
     * @return \Capco\UserBundle\Entity\User
     */
    public function getVoter()
    {
        return $this->Voter;
    }
}
