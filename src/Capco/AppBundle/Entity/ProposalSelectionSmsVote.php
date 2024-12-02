<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository")
 */
class ProposalSelectionSmsVote extends AbstractProposalVote
{
    use PositionableTrait;

    /**
     * @ORM\Column(name="ip_address", type="string", nullable=true)
     * @Assert\Ip(version="all")
     */
    protected ?string $ipAddress = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="selectionSmsVotes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", cascade={"persist"})
     * @ORM\JoinColumn(name="selection_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private SelectionStep $selectionStep;

    /**
     * @ORM\Column(name="consent_sms_communication", type="boolean")
     */
    private string $consentSmsCommunication;

    /**
     * @ORM\Column(name="phone", type="string")
     */
    private string $phone;

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addSelectionSmsVote($this);

        return $this;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->selectionStep;
    }

    public function getSelectionStep(): ?SelectionStep
    {
        return $this->selectionStep;
    }

    public function setSelectionStep(SelectionStep $selectionStep): self
    {
        $this->selectionStep = $selectionStep;

        return $this;
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->getProposal()) {
            $this->getProposal()->removeSelectionSmsVote($this);
        }
    }

    public function getKind(): string
    {
        return 'proposalSelectionSmsVote';
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getProposal(): ?Proposal
    {
        try {
            if ($this->proposal && !$this->proposal->isDeleted()) {
                return $this->proposal;
            }
        } catch (EntityNotFoundException) {
        }

        return null;
    }

    public function getRelated(): ?Proposal
    {
        return $this->getProposal();
    }

    public function getProject(): ?Project
    {
        return $this->getProposal() ? $this->getProposal()->getProject() : null;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress = null): self
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchVoteNestedProposal',
        ]);
    }

    public function getAuthor(): ?User
    {
        return null;
    }

    public function getConsentSmsCommunication(): string
    {
        return $this->consentSmsCommunication;
    }

    public function setConsentSmsCommunication(string $consentSmsCommunication): void
    {
        $this->consentSmsCommunication = $consentSmsCommunication;
    }

    public function getVoteTypeName(): string
    {
        return 'proposalSelectionSmsVote';
    }
}
