<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Capco\AppBundle\Traits\VoteThresholdTrait;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="collect_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CollectStepRepository")
 */
class CollectStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;
    use VoteThresholdTrait;
    use VoteTypeTrait;

    public static $sort = [
        'old',
        'last',
        'votes',
        'least-votes',
        'comments',
        'random',
        'expensive',
        'cheap',
    ];

    public static $sortLabels = [
        'global.filter_f_comments' => 'comments',
        'step.sort.last' => 'last',
        'step.sort.old' => 'old',
        'global.random' => 'random',
        'step.sort.votes' => 'votes',
        'step.sort.least-votes' => 'least-votes',
        'step.sort.expensive' => 'expensive',
        'step.sort.cheap' => 'cheap',
    ];

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="step", cascade={"persist"})
     */
    private $proposalForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="default_status_id", nullable=true)
     */
    private $defaultStatus;

    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private = false;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","least-votes","comments","random", "cheap", "expensive"})
     */
    private $defaultSort = 'random';

    public function __construct()
    {
        parent::__construct();
        $this->requirements = new ArrayCollection();
    }

    public function getDefaultStatus()
    {
        return $this->defaultStatus;
    }

    public function setDefaultStatus(Status $defaultStatus = null): self
    {
        $this->defaultStatus = $defaultStatus;

        return $this;
    }

    public function getProposalForm(): ?ProposalForm
    {
        return $this->proposalForm;
    }

    public function getProposalFormId()
    {
        return $this->proposalForm ? $this->proposalForm->getId() : null;
    }

    public function setProposalForm(ProposalForm $proposalForm = null): self
    {
        if ($this->proposalForm) {
            $this->proposalForm->setStep(null);
        }

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

    public function setPrivate(bool $private): self
    {
        $this->private = $private;

        return $this;
    }

    public function getDefaultSort(): string
    {
        return $this->defaultSort ?? 'random';
    }

    public function setDefaultSort(string $defaultSort): self
    {
        $this->defaultSort = $defaultSort;

        return $this;
    }

    // **************************** Custom methods *******************************

    public function getType(): string
    {
        return 'collect';
    }

    public function isCollectStep(): bool
    {
        return true;
    }

    public function isParticipative(): bool
    {
        return true;
    }
}
