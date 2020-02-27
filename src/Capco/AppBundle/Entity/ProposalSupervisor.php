<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Timestampable;

/**
 * @ORM\Table(name="proposal_supervisor")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSupervisorRepository")
 */
class ProposalSupervisor implements Timestampable
{
    use TimestampableTrait;

    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="supervisedProposals")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id")
     */
    private $supervisor;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="supervisor", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="assigned_by", nullable=false)
     */
    private $assignedBy;

    public function getSupervisor(): ?User
    {
        return $this->supervisor;
    }

    public function setSupervisor(?User $supervisor): self
    {
        $this->supervisor = $supervisor;

        return $this;
    }

    public function getAssignedBy(): ?User
    {
        return $this->assignedBy;
    }

    public function setAssignedBy(?User $assignedBy): self
    {
        $this->assignedBy = $assignedBy;

        return $this;
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }
}
