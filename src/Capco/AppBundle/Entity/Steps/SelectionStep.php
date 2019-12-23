<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Enum\ProposalSort;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Capco\AppBundle\Traits\VoteThresholdTrait;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SelectionStepRepository")
 */
class SelectionStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;
    use VoteThresholdTrait;
    use VoteTypeTrait;

    public const TYPE = 'selection';
    const VOTE_TYPE_DISABLED = 0;
    const VOTE_TYPE_SIMPLE = 1;
    const VOTE_TYPE_BUDGET = 2;

    public static $voteTypeLabels = [
        'step.selection.vote_type.disabled' => self::VOTE_TYPE_DISABLED,
        'step.selection.vote_type.simple' => self::VOTE_TYPE_SIMPLE,
        'step.selection.vote_type.budget' => self::VOTE_TYPE_BUDGET
    ];

    public static $sort = [
        'old',
        'last',
        'votes',
        'least-votes',
        'comments',
        'random',
        'expensive',
        'cheap'
    ];

    public static $sortLabels = [
        'global.filter_f_comments' => 'comments',
        'global.filter_f_last' => 'last',
        'global.filter_f_old' => 'old',
        'global.random' => 'random',
        'step.sort.votes' => 'votes',
        'step.sort.least-votes' => 'least-votes',
        'step.sort.expensive' => 'expensive',
        'step.sort.cheap' => 'cheap'
    ];

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Selection", mappedBy="selectionStep", cascade={"persist"}, orphanRemoval=true)
     */
    private $selections;

    /**
     * @ORM\Column(name="contributors_count", type="integer")
     */
    private $contributorsCount = 0;

    /**
     * @ORM\Column(name="proposals_hidden", type="boolean", nullable=false, options={"default" = false})
     */
    private $proposalsHidden = false;

    /**
     * @ORM\Column(name="allowing_progess_steps", type="boolean")
     */
    private $allowingProgressSteps = false;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","least-votes","comments","random", "cheap", "expensive"})
     */
    private $defaultSort = ProposalSort::RANDOM;

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

    public function isAllowingProgressSteps(): bool
    {
        return $this->allowingProgressSteps;
    }

    public function setAllowingProgressSteps(bool $allowingProgressSteps): self
    {
        $this->allowingProgressSteps = $allowingProgressSteps;

        return $this;
    }

    public function getType()
    {
        return self::TYPE;
    }

    public function isSelectionStep(): bool
    {
        return true;
    }

    public function getProposalForm(): ProposalForm
    {
        $step = (new ArrayCollection($this->getProject()->getExportableSteps()))
            ->filter(function (ProjectAbstractStep $step) {
                return $step->getStep()->isCollectStep();
            })
            ->first();

        if ($step) {
            return $step->getStep()->getProposalForm();
        }

        throw new \Exception('No proposalForm found for this selection step');
    }

    public function getProposals()
    {
        $proposals = [];
        foreach ($this->selections as $selection) {
            $proposals[] = $selection->getProposal();
        }

        return $proposals;
    }

    public function isProposalsHidden(): bool
    {
        return $this->proposalsHidden;
    }

    public function setProposalsHidden(bool $proposalsHidden): self
    {
        $this->proposalsHidden = $proposalsHidden;

        return $this;
    }

    public function canShowProposals(): bool
    {
        return !$this->isProposalsHidden() || $this->getStartAt() <= new \DateTime();
    }

    public function isParticipative(): bool
    {
        return true;
    }
}
