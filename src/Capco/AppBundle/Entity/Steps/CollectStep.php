<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Model\IndexableInterface;

/**
 * @ORM\Table(name="collect_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CollectStepRepository")
 */
class CollectStep extends AbstractStep implements IndexableInterface
{
    use VoteTypeTrait;

    public static $sort = ['old', 'last', 'votes', 'comments', 'random'];

    public static $sortLabels = [
        'comments' => 'step.sort.comments',
        'last' => 'step.sort.last',
        'old' => 'step.sort.old',
        'random' => 'step.sort.random',
        'votes' => 'step.sort.votes',
    ];

    /**
     * @var ProposalForm
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="step", cascade={"persist", "remove"})
     */
    private $proposalForm = null;

    /**
     * @var int
     *
     * @ORM\Column(name="proposals_count", type="integer")
     */
    private $proposalsCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="contributors_count", type="integer")
     */
    private $contributorsCount = 0;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="default_status_id", nullable=true)
     */
    private $defaultStatus = null;

    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     *
     * @var bool
     */
    private $private = 0;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","comments","random"})
     */
    private $defaultSort = 'random';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return int
     */
    public function getProposalsCount()
    {
        return $this->proposalsCount;
    }

    /**
     * @param int $proposalsCount
     *
     * @return $this
     */
    public function setProposalsCount($proposalsCount)
    {
        $this->proposalsCount = $proposalsCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getContributorsCount()
    {
        return $this->contributorsCount;
    }

    /**
     * @param int $contributorsCount
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
    public function getDefaultStatus()
    {
        return $this->defaultStatus;
    }

    public function setDefaultStatus(Status $defaultStatus = null)
    {
        $this->defaultStatus = $defaultStatus;

        return $this;
    }

    /**
     * @return ProposalForm
     */
    public function getProposalForm()
    {
        return $this->proposalForm;
    }

    /**
     * @param ProposalForm $proposalForm
     *
     * @return $this
     */
    public function setProposalForm(ProposalForm $proposalForm = null)
    {
        if ($proposalForm) {
            $proposalForm->setStep($this);
        }
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function isPrivate(): bool
    {
        return $this->private;
    }

    public function setPrivate(bool $private)
    {
        $this->private = $private;
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

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'collect';
    }

    public function isCollectStep()
    {
        return true;
    }

    public function isIndexable()
    {
        return $this->getIsEnabled();
    }
}
