<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Status;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * @ORM\Table(name="progress_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProgressStepRepository")
 * @Serializer\ExclusionPolicy("all")
 */
class ProgressStep
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="title", type="string")
     */
    private $title;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\Column(name="default_status_id", nullable=true)
     */
    private $defaultStatus = null;

    /**
     * @ORM\Column(name="start_at", type="datetime", nullable=true)
     */
    private $startAt = null;

    /**
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt= null;

    /**
     * @var ArrayCollection
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", cascade={"persist"})
     */
    private $proposals = null;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    public function __construct()
    {
        $this->proposals = new ArrayCollection();
    }

    public function getDefaultStatus() : Status
    {
        return $this->defaultStatus;
    }

    public function setDefaultStatus(Status $defaultStatus = null) : self
    {
        $this->defaultStatus = $defaultStatus;

        return $this;
    }

    public function getId() : int
    {
        return $this->id;
    }

    public function setId(int $id) : self
    {
        $this->id = $id;

        return $this;
    }

    public function getTitle() : string
    {
        return $this->title;
    }

    public function setTitle($title) : self
    {
        $this->title = $title;

        return $this;
    }

    public function getStartAt() : \DateTime
    {
        return $this->startAt;
    }

    public function setStartAt($startAt) : self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt() : \DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTime $endAt) : self
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function getProposals() : ArrayCollection
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal) : self
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals->add($proposal);
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal) : self
    {
        $this->proposals->removeElement($proposal);

        return $this;
    }

    public function isEnabled() : bool
    {
        return $this->isEnabled;
    }
}
