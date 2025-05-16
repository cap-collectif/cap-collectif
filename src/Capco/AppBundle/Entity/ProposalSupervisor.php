<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Timestampable;

/**
 * @ORM\Table(name="proposal_supervisor")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSupervisorRepository")
 */
class ProposalSupervisor implements EntityInterface, Timestampable
{
    use TimestampableTrait;

    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="supervisedProposals")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id")
     */
    private User $supervisor;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="supervisor")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="assigned_by",  referencedColumnName="id", nullable=true)
     */
    private User $assignedBy;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct(Proposal $proposal, User $supervisor)
    {
        $this->supervisor = $supervisor;
        $this->proposal = $proposal;
    }

    public function hydrate(User $supervisor, User $assignedBy, Proposal $proposal): self
    {
        $this->supervisor = $supervisor;
        $this->proposal = $proposal;
        $this->assignedBy = $assignedBy;

        return $this;
    }

    public function getSupervisor(): ?User
    {
        return $this->supervisor;
    }

    public function setSupervisor(?User $supervisor): self
    {
        $this->supervisor = $supervisor;

        return $this;
    }

    public function changeSupervisor(User $newSupervisor, User $viewer): self
    {
        if ($this->getSupervisor()) {
            $this->getSupervisor()->removeProposalSupervisor($this);
            $this->supervisor = $newSupervisor;
            $this->supervisor->addSupervisedProposal($this);
            $this->setAssignedBy($viewer);
        }

        return $this;
    }

    public function removeSupervisor(): self
    {
        if ($this->getSupervisor()) {
            $this->getSupervisor()->removeProposalSupervisor($this);
            $this->supervisor = null;
        }

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
