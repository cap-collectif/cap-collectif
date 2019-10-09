<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\EntityNotFoundException;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\AnonymousableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCollectVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser(message="proposal.vote.email_belongs_to_user")
 * @CapcoAssert\DidNotAlreadyVote(message="proposal.vote.already_voted", repositoryPath="CapcoAppBundle:ProposalCollectVote", objectPath="proposal")
 * @CapcoAssert\HasEnoughCreditsToVote()
 */
class ProposalCollectVote extends AbstractVote
{
    use AnonymousableTrait;
    use PrivatableTrait;
    use PositionableTrait;

    const ANONYMOUS = 'ANONYMOUS';

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="collectVotes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", cascade={"persist"})
     * @ORM\JoinColumn(name="collect_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $collectStep;

    public function getStep(): ?CollectStep
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

    public function getProposal(): ?Proposal
    {
        try {
            if (!$this->proposal->isDeleted()) {
                return $this->proposal;
            }
        } catch (EntityNotFoundException $e) {
        }
        return null;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addCollectVote($this);

        return $this;
    }

    public function getRelated(): ?Proposal
    {
        return $this->getProposal();
    }

    public function getKind(): string
    {
        return 'proposalCollectVote';
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote(): void
    {
        if ($this->getProposal()) {
            $this->getProposal()->removeCollectVote($this);
        }
    }

    public function getProject(): ?Project
    {
        return $this->getProposal() ? $this->getProposal()->getProject() : null;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchNestedProposal'
        ]);
    }
}
