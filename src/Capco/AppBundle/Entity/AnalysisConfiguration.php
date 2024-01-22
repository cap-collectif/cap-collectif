<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\QuestionnaireType;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Timestampable;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AnalysisConfigurationRepository")
 * @ORM\Table(name="analysis_configuration")
 */
class AnalysisConfiguration implements Timestampable
{
    use BodyUsingJoditWysiwygTrait;
    use TextableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="analysisConfiguration")
     * @ORM\JoinColumn(nullable=false)
     */
    private ProposalForm $proposalForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", cascade={"persist"})
     * @ORM\JoinColumn(nullable=true, referencedColumnName="id")
     */
    private ?Questionnaire $evaluationForm = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="analysis_step", referencedColumnName="id", onDelete="SET NULL")
     */
    private ?AbstractStep $analysisStep = null;

    /**
     * @ORM\Column(type="datetime", name="effective_date", nullable=true)
     */
    private ?\DateTimeInterface $effectiveDate = null;

    /**
     * @ORM\Column(type="boolean", name="cost_estimation_enabled")
     */
    private bool $costEstimationEnabled = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\JoinColumn(nullable=true, name="favourable_status", onDelete="SET NULL")
     */
    private ?Status $favourableStatus = null;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\JoinTable(name="analysis_unfavourable_statuses",
     *      joinColumns={@ORM\JoinColumn(name="analysis_configuration_id", referencedColumnName="id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="status_id", referencedColumnName="id", onDelete="CASCADE")}
     * )
     */
    private Collection $unfavourableStatuses;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", cascade={"persist"})
     * @ORM\JoinColumn(name="selection_step", nullable=true, referencedColumnName="id", onDelete="SET NULL")
     */
    private ?SelectionStep $moveToSelectionStep = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\JoinColumn(nullable=true, name="selection_step_status", onDelete="CASCADE")
     */
    private ?Status $selectionStepStatus = null;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private \DateTimeInterface $updatedAt;

    /**
     * @ORM\Column(type="boolean", name="effective_date_processed")
     */
    private bool $effectiveDateProcessed = false;

    /**
     * @ORM\OneToMany(targetEntity=AnalysisConfigurationProcess::class, mappedBy="analysisConfiguration")
     */
    private Collection $processes;

    public function __construct()
    {
        $this->unfavourableStatuses = new ArrayCollection();
        $this->processes = new ArrayCollection();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->favourableStatus = null;
            $this->unfavourableStatuses = new ArrayCollection();
            $this->moveToSelectionStep = null;
            $this->selectionStepStatus = null;
            $this->analysisStep = null;
            if ($this->evaluationForm) {
                $clonedEvaluationForm = clone $this->evaluationForm;
                $clonedEvaluationForm
                    ->setProposalForm($this->proposalForm)
                    ->setSlug('copy-of-' . $clonedEvaluationForm->getSlug())
                ;
                $this->setEvaluationForm($clonedEvaluationForm);
            }
        }
    }

    public function getProposalForm(): ProposalForm
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm): self
    {
        $this->proposalForm = $proposalForm;
        $proposalForm->setAnalysisConfiguration($this);

        return $this;
    }

    public function getEvaluationForm(): ?Questionnaire
    {
        return $this->evaluationForm;
    }

    public function setEvaluationForm(?Questionnaire $evaluationForm = null): self
    {
        if ($evaluationForm) {
            $type = QuestionnaireType::QUESTIONNAIRE_ANALYSIS;
            $evaluationForm->setType($type);
        }

        $this->evaluationForm = $evaluationForm;

        return $this;
    }

    public function getAnalysisStep(): ?AbstractStep
    {
        return $this->analysisStep;
    }

    public function setAnalysisStep(AbstractStep $analysisStep): self
    {
        $this->analysisStep = $analysisStep;

        return $this;
    }

    public function getEffectiveDate(): ?\DateTimeInterface
    {
        return $this->effectiveDate;
    }

    public function setEffectiveDateAndProcessed(?\DateTime $effectiveDate = null): self
    {
        if ($effectiveDate !== $this->effectiveDate) {
            $this->setEffectiveDateProcessed(false);
        }
        $this->effectiveDate = $effectiveDate;

        return $this;
    }

    public function setEffectiveDate(?\DateTime $effectiveDate = null): self
    {
        $this->effectiveDate = $effectiveDate;

        return $this;
    }

    public function getMoveToSelectionStep(): ?SelectionStep
    {
        return $this->moveToSelectionStep;
    }

    public function setMoveToSelectionStep(?SelectionStep $moveToSelectionStep = null): self
    {
        $this->moveToSelectionStep = $moveToSelectionStep;

        return $this;
    }

    public function getSelectionStepStatus(): ?Status
    {
        return $this->selectionStepStatus;
    }

    public function setSelectionStepStatus(?Status $selectionStepStatus = null): self
    {
        $this->selectionStepStatus = $selectionStepStatus;

        return $this;
    }

    public function getUnfavourableStatuses(): Collection
    {
        return $this->unfavourableStatuses;
    }

    public function addUnfavourableStatus(Status $favourableStatus): self
    {
        if (!$this->unfavourableStatuses->contains($favourableStatus)) {
            $this->unfavourableStatuses[] = $favourableStatus;
        }

        return $this;
    }

    public function isImmediatelyEffective(): bool
    {
        $now = new \DateTime();

        return null == $this->getEffectiveDate()
            || $this->getEffectiveDate()->getTimestamp() < $now->getTimestamp();
    }

    public function removeUnfavourableStatus(Status $favourableStatus): self
    {
        if ($this->unfavourableStatuses->contains($favourableStatus)) {
            $this->unfavourableStatuses->removeElement($favourableStatus);
        }

        return $this;
    }

    public function setUnfavourablesStatuses(array $unfavourablesStatuses = []): self
    {
        $this->unfavourableStatuses = new ArrayCollection($unfavourablesStatuses);

        return $this;
    }

    public function getFavourableStatus(): ?Status
    {
        return $this->favourableStatus;
    }

    public function setFavourableStatus(?Status $favourableStatus = null): self
    {
        $this->favourableStatus = $favourableStatus;

        return $this;
    }

    public function isCostEstimationEnabled(): bool
    {
        return $this->costEstimationEnabled;
    }

    public function setCostEstimationEnabled(bool $costEstimationEnabled): self
    {
        $this->costEstimationEnabled = $costEstimationEnabled;

        return $this;
    }

    public function getEffectiveDateProcessed(): bool
    {
        return $this->effectiveDateProcessed;
    }

    public function setEffectiveDateProcessed(bool $effectiveDateProcessed): self
    {
        $this->effectiveDateProcessed = $effectiveDateProcessed;

        return $this;
    }

    public function getProcesses(): Collection
    {
        return $this->processes;
    }

    public function addProcess(AnalysisConfigurationProcess $process): self
    {
        if (!$this->processes->contains($process)) {
            $this->processes[] = $process;
            $process->setAnalysisConfiguration($this);
        }

        return $this;
    }

    public function removeProcess(AnalysisConfigurationProcess $process): self
    {
        if ($this->processes->removeElement($process)) {
            // set the owning side to null (unless already changed)
            if ($process->getAnalysisConfiguration() === $this) {
                $process->setAnalysisConfiguration(null);
            }
        }

        return $this;
    }
}
