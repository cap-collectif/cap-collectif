<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Traits\VoteThresholdTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Entity\Selection;

/**
 * Class SelectionStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SelectionStepRepository")
 * @CapcoAssert\HasOnlyOneSelectionPerProposal()
 */
class SelectionStep extends AbstractStep
{
    use VoteThresholdTrait;

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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Selection", mappedBy="selectionStep", cascade={"persist"}, orphanRemoval=true)
     */
    private $selections;

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
     * @ORM\Column(name="proposals_visible", type="boolean", nullable=false, options={"default" = true})
     */
    private $proposalsVisible = true;

    /**
     * @ORM\Column(name="allowing_progess_steps", type="boolean")
     */
    private $allowingProgressSteps = false;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","comments","random"})
     */
    private $defaultSort = 'random';

    public function __construct()
    {
        parent::__construct();
        $this->selections = new ArrayCollection();
    }

    public function addSelection(Selection $selection)
    {
        if (!$this->selections->contains($selection)) {
            $this->selections[] = $selection;
            $selection->setSelectionStep($this);
        }

        return $this;
    }

    public function removeSelection(Selection $selection)
    {
        $this->selections->removeElement($selection);
    }

    public function getSelections()
    {
        return $this->selections;
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

    public function isAllowingProgressSteps() : bool
    {
        return $this->allowingProgressSteps;
    }

    public function setAllowingProgressSteps(bool $allowingProgressSteps) : self
    {
        $this->allowingProgressSteps = $allowingProgressSteps;

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
        if (count($this->getSelections()) > 0) {
            return $this->getSelections()[0]->getProposal()->getProposalForm();
        }

        return;
    }

    public function getProposals()
    {
        $proposals = [];
        foreach ($this->selections as $selection) {
            $proposals[] = $selection->getProposal();
        }

        return $proposals;
    }

    public function getProposalsIds()
    {
        $ids = array_filter(array_map(function ($value) {
            return $value->getProposal() ? $value->getProposal()->getId() : null;
        }, $this->getSelections()->getValues()),
            function ($value) {
                return $value !== null;
            });

        return $ids;
    }

    public function getProposalsVisible() : bool
    {
        return $this->proposalsVisible;
    }

    public function setProposalsVisible(bool $proposalsVisible) : self
    {
        $this->proposalsVisible = $proposalsVisible;

        return $this;
    }

    public function canShowProposals() : bool
    {
        return $this->getProposalsVisible() || $this->getStartAt() <= new \DateTime();
    }
}
