<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Timestampable;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="proposal_decision_maker")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalDecisionMakerRepository")
 */
class ProposalDecisionMaker implements Timestampable
{
    use TimestampableTrait;

    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="decision_maker_id")
     */
    private $decisionMaker;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="decisionMaker")
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposal;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private $updatedAt;

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
}
