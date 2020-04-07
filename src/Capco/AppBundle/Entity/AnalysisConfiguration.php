<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Timestampable;
use Capco\AppBundle\Traits\TextableTrait;
use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AnalysisConfigurationRepository")
 * @ORM\Table(name="analysis_configuration")
 */
class AnalysisConfiguration implements Timestampable
{
    use TimestampableTrait;
    use UuidTrait;
    use TextableTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="analysisConfiguration")
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposalForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire")
     * @ORM\JoinColumn(nullable=true, referencedColumnName="id")
     */
    private $evaluationForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="analysis_step", referencedColumnName="id")
     */
    private $analysisStep;

    /**
     * @ORM\Column(type="datetime", name="effective_date", nullable=true)
     */
    private $effectiveDate;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status")
     * @ORM\JoinColumn(nullable=true, name="favourable_status", nullable=true)
     */
    private $favourableStatus;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Status")
     * @ORM\JoinTable(name="analysis_unfavourable_statuses",
     *      joinColumns={@ORM\JoinColumn(name="analysis_configuration_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="status_id", referencedColumnName="id")}
     * )
     */
    private $unfavourableStatuses;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep")
     * @ORM\JoinColumn(name="selection_step", nullable=false, referencedColumnName="id")
     */
    private $moveToSelectionStep;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private $updatedAt;

    public function __construct()
    {
        $this->unfavourableStatuses = new ArrayCollection();
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

    public function setEvaluationForm(Questionnaire $evaluationForm = null): self
    {
        $this->evaluationForm = $evaluationForm;

        return $this;
    }

    public function getAnalysisStep(): AbstractStep
    {
        return $this->analysisStep;
    }

    public function setAnalysisStep(AbstractStep $analysisStep): self
    {
        $this->analysisStep = $analysisStep;

        return $this;
    }

    public function getEffectiveDate(): ?\DateTime
    {
        return $this->effectiveDate;
    }

    public function setEffectiveDate(\DateTime $effectiveDate = null): self
    {
        $this->effectiveDate = $effectiveDate;

        return $this;
    }

    public function getMoveToSelectionStep(): SelectionStep
    {
        return $this->moveToSelectionStep;
    }

    public function setMoveToSelectionStep(SelectionStep $moveToSelectionStep): self
    {
        $this->moveToSelectionStep = $moveToSelectionStep;

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
}
