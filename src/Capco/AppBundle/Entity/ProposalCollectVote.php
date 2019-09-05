<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\AnonymousableTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\ORM\Mapping as ORM;

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

    public function getStep(): CollectStep
    {
        return $this->collectStep;
    }

    public function getCollectStep(): CollectStep
    {
        return $this->collectStep;
    }

    public function setCollectStep(CollectStep $collectStep): self
    {
        $this->collectStep = $collectStep;

        return $this;
    }

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addCollectVote($this);

        return $this;
    }

    public function getRelated()
    {
        return $this->proposal;
    }

    public function getKind(): string
    {
        return 'proposalCollectVote';
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        $this->proposal->removeCollectVote($this);
    }

    public function getProject(): Project
    {
        return $this->getProposal()->getProject();
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchNestedProject',
            'ElasticsearchNestedProposal'
        ]);
    }
}
