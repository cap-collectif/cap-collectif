<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * ProposalCollectVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCollectVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser(message="proposal.vote.email_belongs_to_user")
 * @CapcoAssert\DidNotAlreadyVote(message="proposal.vote.already_voted", repositoryPath="CapcoAppBundle:ProposalCollectVote", objectPath="proposal")
 * @CapcoAssert\HasEnoughCreditsToVote()
 */
class ProposalCollectVote extends AbstractVote
{
    use \Capco\AppBundle\Traits\AnonymousableTrait;
    use \Capco\AppBundle\Traits\PrivatableTrait;

    const ANONYMOUS = 'ANONYMOUS';

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="collectVotes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", cascade={"persist"})
     * @ORM\JoinColumn(name="collect_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $collectStep;

    /**
     * @return mixed
     */
    public function getCollectStep()
    {
        return $this->collectStep;
    }

    /**
     * @param CollectStep $collectStep
     *
     * @return ProposalCollectVote
     */
    public function setCollectStep(CollectStep $collectStep) :ProposalCollectVote
    {
        $this->collectStep = $collectStep;

        return $this;
    }

    /**
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    /**
     * @param Proposal $proposal
     *
     * @return ProposalCollectVote
     */
    public function setProposal(Proposal $proposal) :ProposalCollectVote
    {
        $this->proposal = $proposal;
        $proposal->addCollectVote($this);

        return $this;
    }

    public function getRelatedEntity()
    {
        return $this->proposal;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->proposal) {
            $this->proposal->removeCollectVote($this);
        }
    }
}
