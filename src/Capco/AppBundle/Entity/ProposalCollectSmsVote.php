<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository")
 */
class ProposalCollectSmsVote extends AbstractProposalVote implements ExportableContributionInterface
{
    use PositionableTrait;

    /**
     * @ORM\Column(name="ip_address", type="string", nullable=true)
     * @Assert\Ip(version="all")
     */
    protected ?string $ipAddress = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="collectSmsVotes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", cascade={"persist"})
     * @ORM\JoinColumn(name="collect_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private CollectStep $collectStep;

    /**
     * @ORM\Column(name="phone", type="string")
     */
    private string $phone;

    /**
     * @ORM\Column(name="consent_sms_communication", type="boolean")
     */
    private string $consentSmsCommunication;

    public function getStep(): ?AbstractStep
    {
        return $this->collectStep;
    }

    public function getCollectStep(): ?CollectStep
    {
        return $this->collectStep;
    }

    public function setCollectStep(CollectStep $collectStep): self
    {
        $this->collectStep = $collectStep;

        return $this;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addCollectSmsVote($this);

        return $this;
    }

    public function getKind(): string
    {
        return 'proposalCollectSmsVote';
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote(): void
    {
        if ($this->getProposal()) {
            $this->getProposal()->removeCollectSmsVote($this);
        }
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

    public function setConsentSmsCommunication(string $consentSmsCommunication): self
    {
        $this->consentSmsCommunication = $consentSmsCommunication;

        return $this;
    }

    public function getVoteTypeName(): string
    {
        return 'proposalCollectSmsVote';
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
}
