<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Timestampable;

/**
 * @ORM\Table(name="proposal_decision_maker")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalDecisionMakerRepository")
 */
class ProposalDecisionMaker implements EntityInterface, Timestampable
{
    use TimestampableTrait;

    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="decision_maker_id")
     */
    private User $decisionMaker;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="decisionMaker")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct(Proposal $proposal, User $decisionMaker)
    {
        $this->decisionMaker = $decisionMaker;
        $this->proposal = $proposal;
    }

    public function getDecisionMaker(): ?User
    {
        return $this->decisionMaker;
    }

    public function setDecisionMaker(?User $decisionMaker): self
    {
        $this->decisionMaker = $decisionMaker;

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

    public function changeDecisionMaker(User $newDecisionMaker): self
    {
        if ($this->getDecisionMaker()) {
            $this->decisionMaker = $newDecisionMaker;
        }

        return $this;
    }
}
