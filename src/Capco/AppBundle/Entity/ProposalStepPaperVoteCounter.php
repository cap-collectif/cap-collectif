<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 *     name="proposal_step_paper_vote_counter",
 *     uniqueConstraints={@ORM\UniqueConstraint(columns={"step_id", "proposal_id"})}
 *     )
 * @ORM\Entity(repositoryClass=ProposalStepPaperVoteCounterRepository::class)
 */
class ProposalStepPaperVoteCounter implements ExportableContributionInterface
{
    private const PROPOSAL_PAPER_VOTE_STEP_NOT_ALLOWED = 'PROPOSAL_PAPER_VOTE_STEP_NOT_ALLOWED';

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity=Proposal::class, inversedBy="paperVotes")
     * @ORM\JoinColumn(nullable=false)
     */
    private Proposal $proposal;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep", inversedBy="proposalStepPaperVoteCounters")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false)
     */
    private AbstractStep $step;

    /**
     * @ORM\Column(type="integer")
     */
    private int $totalCount;

    /**
     * @ORM\Column(type="integer")
     */
    private int $totalPointsCount;

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    public function setTotalCount(int $totalCount): self
    {
        $this->totalCount = $totalCount;

        return $this;
    }

    public function getTotalPointsCount(): int
    {
        return $this->totalPointsCount;
    }

    public function setTotalPointsCount(int $totalPointsCount): self
    {
        $this->totalPointsCount = $totalPointsCount;

        return $this;
    }

    public function getStep(): AbstractStep
    {
        return $this->step;
    }

    public function setStep(AbstractStep $step): self
    {
        if ($step instanceof CollectStep || $step instanceof SelectionStep) {
            $this->step = $step;
        } else {
            throw new \RuntimeException(self::PROPOSAL_PAPER_VOTE_STEP_NOT_ALLOWED);
        }

        return $this;
    }
}
