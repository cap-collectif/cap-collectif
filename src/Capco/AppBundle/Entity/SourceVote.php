<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ArgumentVote
 *
 * @ORM\Table(name="source_vote")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class SourceVote
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="Votes", cascade={"persist"})
     */
    private $source;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id", onDelete="CASCADE")
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
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param mixed $source
     * @return $this
     */
    public function setSource($source)
    {
        $this->source = $source;
        $this->source->addVote($this);
        return $this;
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

    // ***************************** Lifecycle ****************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->source != null) {
            $this->source->removeVote($this);
        }

    }
}
