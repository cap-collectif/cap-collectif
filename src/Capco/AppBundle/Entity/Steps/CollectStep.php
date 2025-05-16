<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\CollectStepImapServerConfig;
use Capco\AppBundle\Entity\Interfaces\DefaultStatusInterface;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Interfaces\VotableStepInterface;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Enum\ProposalSort;
use Capco\AppBundle\Traits\AllowAuthorsToAddNewsTrait;
use Capco\AppBundle\Traits\ProposalArchivedTrait;
use Capco\AppBundle\Traits\SecretBallotTrait;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Capco\AppBundle\Traits\VoteSmsTrait;
use Capco\AppBundle\Traits\VoteThresholdTrait;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="collect_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CollectStepRepository")
 * @CapcoAssert\VoteMin
 */
class CollectStep extends AbstractStep implements ParticipativeStepInterface, VotableStepInterface, DefaultStatusInterface
{
    use AllowAuthorsToAddNewsTrait;
    use ProposalArchivedTrait;
    use SecretBallotTrait;
    use TimelessStepTrait;
    use VoteSmsTrait;
    use VoteThresholdTrait;
    use VoteTypeTrait;

    final public const TYPE = 'collect';

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
        'global.filter_f_last' => 'last',
        'global.filter_f_old' => 'old',
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
     * @ORM\JoinColumn(name="default_status_id", nullable=true, onDelete="SET NULL")
     */
    private ?Status $defaultStatus = null;

    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private = false;

    /**
     * @ORM\Column(name="default_sort", type="string", nullable=false)
     * @Assert\Choice(choices={"old","last","votes","least-votes","comments","random", "cheap", "expensive"})
     */
    private $defaultSort = ProposalSort::RANDOM;

    /**
     * @ORM\OneToOne(targetEntity=CollectStepImapServerConfig::class, mappedBy="collectStep", cascade={"persist", "remove"})
     */
    private ?CollectStepImapServerConfig $collectStepImapServerConfig = null;

    /**
     * @ORM\Column(name="is_collect_by_email_enabled", type="boolean", nullable=false, options={"default":0})
     */
    private bool $isCollectByEmailEnabled = false;

    public function __clone()
    {
        if ($this->id) {
            parent::__clone();
            if ($proposalForm = $this->getProposalForm()) {
                $clonedProposalForm = clone $proposalForm;
                $clonedProposalForm->setStep($this);
                $this->proposalForm = $clonedProposalForm;
            }
        }
    }

    public function getDefaultStatus(): ?Status
    {
        return $this->defaultStatus;
    }

    public function setDefaultStatus(?Status $defaultStatus = null): self
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

    public function setProposalForm(?ProposalForm $proposalForm = null): self
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
        return self::TYPE;
    }

    public function isCollectStep(): bool
    {
        return true;
    }

    public function isParticipative(): bool
    {
        return true;
    }

    public function useAddressOrMap(): bool
    {
        if ($this->getProposalForm() && $this->getProposalForm()->isMapViewEnabled()) {
            return true;
        }
        if ($this->getProposalForm() && $this->getProposalForm()->getUsingAddress()) {
            return true;
        }
        foreach ($this->getRequirements() as $requirement) {
            if ('POSTAL_ADDRESS' === $requirement->getType()) {
                return true;
            }
        }

        return false;
    }

    public function getCollectStepImapServerConfig(): ?CollectStepImapServerConfig
    {
        return $this->collectStepImapServerConfig;
    }

    public function setCollectStepImapServerConfig(?CollectStepImapServerConfig $collectStepImapServerConfig): self
    {
        // unset the owning side of the relation if necessary
        if (null === $collectStepImapServerConfig && null !== $this->collectStepImapServerConfig) {
            $this->collectStepImapServerConfig->setCollectStep(null);
        }

        // set the owning side of the relation if necessary
        if (null !== $collectStepImapServerConfig && $collectStepImapServerConfig->getCollectStep() !== $this) {
            $collectStepImapServerConfig->setCollectStep($this);
        }

        $this->collectStepImapServerConfig = $collectStepImapServerConfig;

        return $this;
    }

    public function isCollectByEmailEnabled(): bool
    {
        return $this->isCollectByEmailEnabled;
    }

    public function setIsCollectByEmailEnabled(bool $isCollectByEmailEnabled): self
    {
        $this->isCollectByEmailEnabled = $isCollectByEmailEnabled;

        return $this;
    }
}
