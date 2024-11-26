<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationStepRepository")
 */
class ConsultationStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;

    final public const TYPE = 'consultation';

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Consultation", mappedBy="step", cascade={"persist"})
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $consultations;

    public function __construct()
    {
        parent::__construct();
        $this->consultations = new ArrayCollection();
    }

    public function __clone()
    {
        if ($this->id) {
            parent::__clone();
            $originalConsultations = $this->consultations;
            $this->consultations = new ArrayCollection();
            foreach ($originalConsultations as $consultation) {
                $cloneConsultation = clone $consultation;
                $this->addConsultation($cloneConsultation);
                $cloneConsultation->setStep($this);
            }
        }
    }

    /**
     * @return Collection|Consultation[]
     */
    public function getConsultations(): Collection
    {
        return $this->consultations;
    }

    public function getFirstConsultation(): ?Consultation
    {
        return $this->consultations->count() > 0 ? $this->consultations->first() : null;
    }

    public function addConsultation(Consultation $consultation): self
    {
        if (!$this->consultations->contains($consultation)) {
            $this->consultations->add($consultation);
            $consultation->setStep($this);
        }

        return $this;
    }

    public function removeConsultation(Consultation $consultation): self
    {
        if ($this->consultations->contains($consultation)) {
            $this->consultations->removeElement($consultation);
            $consultation->clearStep();
        }

        return $this;
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
        return self::TYPE;
    }

    public function isConsultationStep(): bool
    {
        return true;
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

    public function isMultiConsultation(): bool
    {
        return $this->consultations->count() > 1;
    }

    public function isVotable(): bool
    {
        $consultations = $this->getConsultations();

        if (0 === $consultations->count()) {
            return false;
        }

        foreach ($consultations as $consultation) {
            foreach ($consultation->getOpinionTypes() as $opinionType) {
                if (OpinionType::VOTE_WIDGET_DISABLED !== $opinionType->getVoteWidgetType()) {
                    return true;
                }
            }
        }

        return false;
    }
}
