<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ArgumentVote
 *
 * @ORM\Table(name="argument_vote")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class ArgumentVote
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
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Votes", cascade={"persist"})
     */
    private $argument;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id")
     */
    private $Voter;

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
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return mixed
     */
    public function getArgument()
    {
        return $this->argument;
    }

    /**
     * @param mixed $argument
     */
    public function setArgument($argument)
    {
        if($this->argument != null) {
            $this->argument->removeVote($this);
        }
        $this->argument = $argument;
        $argument->addVote($this);
    }

    /**
     * @return mixed
     */
    public function getVoter()
    {
        return $this->Voter;
    }

    /**
     * @param mixed $Voter
     */
    public function setVoter($Voter)
    {
        $this->Voter = $Voter;
    }


    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return ArgumentVote
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return ArgumentVote
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->argument != null) {
            $this->argument->removeVote($this);
        }

    }
}
