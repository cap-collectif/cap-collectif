<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class SelectionStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SelectionStepRepository")
 */
class SelectionStep extends AbstractStep
{
    const VOTE_TYPE_DISABLED = 0;
    const VOTE_TYPE_SIMPLE = 1;
    const VOTE_TYPE_BUDGET = 2;

    public static $voteTypeLabels = [
        self::VOTE_TYPE_DISABLED => 'step.selection.vote_type.disabled',
        self::VOTE_TYPE_SIMPLE => 'step.selection.vote_type.simple',
        self::VOTE_TYPE_BUDGET => 'step.selection.vote_type.budget',
    ];

    public static $sort = ['old', 'last', 'votes', 'comments', 'random'];

    public static $sortLabels = [
        'comments' => 'step.sort.comments',
        'last' => 'step.sort.last',
        'old' => 'step.sort.old',
        'random' => 'step.sort.random',
        'votes' => 'step.sort.votes',
    ];

    /**
     * @var \Doctrine\Common\Collections\ArrayCollection
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="selectionSteps", cascade={"persist"})
     */
    private $proposals;

    /**
     * @Assert\Choice(choices={0,1,2})
     * @ORM\Column(name="vote_type", type="integer")
     */
    private $voteType = self::VOTE_TYPE_DISABLED;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @ORM\Column(name="votes_help_text", type="string", nullable=true)
     */
    private $votesHelpText = null;

    /**
     * @var int
     *
     * @ORM\Column(name="contributors_count", type="integer")
     */
    private $contributorsCount = 0;

    /**
     * @ORM\Column(name="budget", type="float", nullable=true)
     */
    private $budget = null;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","comments","random"})
     */
    private $defaultSort = 'random';

    public function __construct()
    {
        parent::__construct();
        $this->proposals = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * Add proposal.
     *
     * @param Proposal $proposal
     *
     * @return Proposal
     */
    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
            $proposal->addSelectionStep($this);
        }

        return $this;
    }

    /**
     * Remove proposal.
     *
     * @param Proposal $proposal
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
        $proposal->removeSelectionStep($this);
    }

    /**
     * @return mixed
     */
    public function getVotesCount()
    {
        if (!$this->votesCount) {
            return 0;
        }

        return $this->votesCount;
    }

    /**
     * @param mixed $votesCount
     *
     * @return $this
     */
    public function setVotesCount($votesCount)
    {
        $this->votesCount = $votesCount;

        return $this;
    }

    public function incrementVotesCount()
    {
        ++$this->votesCount;

        return $this;
    }

    public function decrementVotesCount()
    {
        --$this->votesCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getVotesHelpText()
    {
        return $this->votesHelpText;
    }

    /**
     * @param mixed $votesHelpText
     *
     * @return $this
     */
    public function setVotesHelpText($votesHelpText)
    {
        $this->votesHelpText = $votesHelpText;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getContributorsCount()
    {
        return $this->contributorsCount;
    }

    /**
     * @param mixed $contributorsCount
     *
     * @return $this
     */
    public function setContributorsCount($contributorsCount)
    {
        $this->contributorsCount = $contributorsCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getVoteType()
    {
        return $this->voteType;
    }

    /**
     * @param mixed $voteType
     *
     * @return $this
     */
    public function setVoteType($voteType)
    {
        $this->voteType = $voteType;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getBudget()
    {
        return $this->budget;
    }

    /**
     * @param mixed $budget
     *
     * @return $this
     */
    public function setBudget($budget)
    {
        $this->budget = $budget;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getDefaultSort()
    {
        return $this->defaultSort;
    }

    /**
     * @param mixed $defaultSort
     *
     * @return $this
     */
    public function setDefaultSort($defaultSort)
    {
        $this->defaultSort = $defaultSort;

        return $this;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'selection';
    }

    public function isSelectionStep()
    {
        return true;
    }

    public function isVotable()
    {
        return $this->voteType !== self::VOTE_TYPE_DISABLED;
    }

    public function isBudgetVotable()
    {
        return $this->voteType === self::VOTE_TYPE_BUDGET;
    }

    public function getProposalForm()
    {
        if (count($this->getProposals())) {
            return $this->getProposals()[0]->getProposalForm();
        }

        return;
    }
}
