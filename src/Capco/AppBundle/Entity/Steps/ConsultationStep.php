<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class ConsultationStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationStepRepository")
 */
class ConsultationStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;

    /**
     * @ORM\Column(name="opinion_count", type="integer")
     */
    private $opinionCount = 0;

    /**
     * @ORM\Column(name="opinion_count_shown_by_section", type="integer")
     * @Assert\Range(max=20,min=1)
     */
    private $opinionCountShownBySection = 5;

    /**
     * @ORM\Column(name="trashed_opinion_count", type="integer")
     */
    private $trashedOpinionCount = 0;

    /**
     * @ORM\Column(name="opinion_versions_count", type="integer")
     */
    private $opinionVersionsCount = 0;

    /**
     * @ORM\Column(name="trashed_opinion_versions_count", type="integer")
     */
    private $trashedOpinionVersionsCount = 0;

    /**
     * @ORM\Column(name="argument_count", type="integer")
     */
    private $argumentCount = 0;

    /**
     * @ORM\Column(name="trashed_argument_count", type="integer")
     */
    private $trashedArgumentCount = 0;

    /**
     * @ORM\Column(name="sources_count", type="integer")
     */
    private $sourcesCount = 0;

    /**
     * @ORM\Column(name="trashed_sources_count", type="integer")
     */
    private $trashedSourceCount = 0;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @ORM\Column(name="contributors_count", type="integer")
     */
    private $contributorsCount = 0;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="step",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $opinions;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStepType", mappedBy="step")
     */
    private $consultationStepType;

    /**
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private $titleHelpText;

    /**
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private $descriptionHelpText;

    /**
     * @ORM\Column(name="moderating_on_create", type="boolean", nullable=false, options={"default" = false})
     */
    private $moderatingOnCreate = false;

    /**
     * @ORM\Column(name="moderating_on_update", type="boolean", nullable=false, options={"default" = false})
     */
    private $moderatingOnUpdate = false;

    public function __construct()
    {
        parent::__construct();
        $this->requirements = new ArrayCollection();
        $this->opinions = new ArrayCollection();
    }

    public function isModeratingOnCreate(): bool
    {
        return $this->moderatingOnCreate;
    }

    public function setModeratingOnCreate(bool $value): self
    {
        $this->moderatingOnCreate = $value;

        return $this;
    }

    public function isModeratingOnUpdate(): bool
    {
        return $this->moderatingOnUpdate;
    }

    public function setModeratingOnUpdate(bool $value): self
    {
        $this->moderatingOnUpdate = $value;

        return $this;
    }

    public function getOpinionCount(): int
    {
        return $this->opinionCount ?? 0;
    }

    public function setOpinionCount(int $opinionCount): self
    {
        $this->opinionCount = $opinionCount;

        return $this;
    }

    public function getOpinionCountShownBySection(): int
    {
        return $this->opinionCountShownBySection;
    }

    public function setOpinionCountShownBySection(int $opinionCountShownBySection): self
    {
        $this->opinionCountShownBySection = $opinionCountShownBySection;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedOpinionCount()
    {
        return $this->trashedOpinionCount;
    }

    /**
     * @param $trashedOpinionCount
     *
     * @return $this
     */
    public function setTrashedOpinionCount($trashedOpinionCount)
    {
        $this->trashedOpinionCount = $trashedOpinionCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getOpinionVersionsCount()
    {
        return $this->opinionVersionsCount;
    }

    /**
     * @param int $opinionVersionsCount
     */
    public function setOpinionVersionsCount($opinionVersionsCount)
    {
        $this->opinionVersionsCount = $opinionVersionsCount;
    }

    /**
     * @return int
     */
    public function getTrashedOpinionVersionsCount()
    {
        return $this->trashedOpinionVersionsCount;
    }

    /**
     * @param int $trashedOpinionVersionsCount
     */
    public function setTrashedOpinionVersionsCount($trashedOpinionVersionsCount)
    {
        $this->trashedOpinionVersionsCount = $trashedOpinionVersionsCount;
    }

    /**
     * @return int
     */
    public function getArgumentCount()
    {
        return $this->argumentCount;
    }

    /**
     * @param $argumentCount
     *
     * @return $this
     */
    public function setArgumentCount($argumentCount)
    {
        $this->argumentCount = $argumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedArgumentCount()
    {
        return $this->trashedArgumentCount;
    }

    /**
     * @param $trashedArgumentCount
     *
     * @return $this
     */
    public function setTrashedArgumentCount($trashedArgumentCount)
    {
        $this->trashedArgumentCount = $trashedArgumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
    }

    /**
     * @param int $sourcesCount
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;
    }

    /**
     * @return int
     */
    public function getTrashedSourceCount()
    {
        return $this->trashedSourceCount;
    }

    /**
     * @param int $trashedSourceCount
     */
    public function setTrashedSourceCount($trashedSourceCount)
    {
        $this->trashedSourceCount = $trashedSourceCount;
    }

    /**
     * @return int
     */
    public function getVotesCount()
    {
        return $this->votesCount;
    }

    /**
     * @param int $votesCount
     *
     * @return $this
     */
    public function setVotesCount($votesCount)
    {
        $this->votesCount = $votesCount;

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
     * @return ArrayCollection
     */
    public function getOpinions()
    {
        return $this->opinions;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function addOpinion($opinion)
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions->add($opinion);
        }

        return $this;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function removeOpinion($opinion)
    {
        $this->opinions->removeElement($opinion);

        return $this;
    }

    /**
     * @return null|ConsultationStepType
     */
    public function getConsultationStepType(): ?ConsultationStepType
    {
        return $this->consultationStepType;
    }

    public function setConsultationStepType(ConsultationStepType $consultationStepType = null)
    {
        if ($this->consultationStepType) {
            $this->consultationStepType->setStep(null);
        }
        if ($consultationStepType) {
            $consultationStepType->setStep($this);
        }
    }

    // **************************** Custom methods *******************************

    public function getProjectId(): ?string
    {
        if (!$this->projectAbstractStep) {
            return null;
        }

        return $this->projectAbstractStep->getProject()->getId();
    }

    public function getType()
    {
        return 'consultation';
    }

    public function isConsultationStep(): bool
    {
        return true;
    }

    /**
     * @return int
     */
    public function getContributionsCount(): int
    {
        return $this->opinionCount +
            $this->trashedOpinionCount +
            $this->argumentCount +
            $this->trashedArgumentCount +
            $this->opinionVersionsCount +
            $this->trashedOpinionVersionsCount +
            $this->sourcesCount +
            $this->trashedSourceCount;
    }

    public function getLabelTitle(): string
    {
        $label = $this->getTitle();
        if ($this->getProject()) {
            $label = $this->getProject()->getTitle() . ' - ' . $label;
        }

        return $label;
    }

    public function isParticipative(): bool
    {
        return true;
    }

    /**
     * @return null|string
     */
    public function getTitleHelpText()
    {
        return $this->titleHelpText;
    }

    public function setTitleHelpText(string $titleHelpText = null): self
    {
        $this->titleHelpText = $titleHelpText;

        return $this;
    }

    public function isVotable(): bool
    {
        /** @var ConsultationStepType $consultationStepType */
        $consultationStepType = $this->consultationStepType;

        /** @var OpinionType $opinionType */
        foreach ($consultationStepType->getOpinionTypes() as $opinionType) {
            if (OpinionType::VOTE_WIDGET_DISABLED !== $opinionType->getVoteWidgetType()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return null|string
     */
    public function getDescriptionHelpText()
    {
        return $this->descriptionHelpText;
    }

    public function setDescriptionHelpText(string $descriptionHelpText = null): self
    {
        $this->descriptionHelpText = $descriptionHelpText;

        return $this;
    }
}
