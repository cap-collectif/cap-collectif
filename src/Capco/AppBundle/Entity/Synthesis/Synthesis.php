<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Capco\AppBundle\Traits\SoftDeleteTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Synthesis.
 *
 * @ORM\Table(name="synthesis")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Synthesis\SynthesisRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\ConsultationStepExists()
 */
class Synthesis
{
    use UuidTrait, SoftDeleteTrait;
    const SOURCE_TYPE_NONE = 'none';
    const SOURCE_TYPE_CONSULTATION = 'consultation_step';

    public static $sourceTypesLabels = [
        'global.consultation' => self::SOURCE_TYPE_CONSULTATION,
        'synthesis.source_types.none' => self::SOURCE_TYPE_NONE,
    ];

    /**
     * @ORM\Column(name="enabled", type="boolean")
     */
    private $enabled = false;

    /**
     * @ORM\Column(name="editable", type="boolean")
     */
    private $editable = true;

    /**
     * @var string
     * @ORM\Column(name="source_type", type="string", length=255)
     * @Assert\Choice(choices = {"consultation_step", "file", "none"})
     */
    private $sourceType = 'none';

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep")
     * @ORM\JoinColumn(name="consultation_step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $consultationStep;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="synthesis", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $elements;

    /**
     * @ORM\Column(name="display_rules", type="json", nullable=true)
     */
    private $displayRules = ['level' => 0];

    public function __construct()
    {
        $this->elements = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;

        return $this;
    }

    /**
     * @return mixed
     */
    public function isEditable()
    {
        return $this->editable;
    }

    /**
     * @param mixed $editable
     */
    public function setEditable($editable)
    {
        $this->editable = $editable;

        return $this;
    }

    /**
     * @return string
     */
    public function getSourceType()
    {
        return $this->sourceType;
    }

    /**
     * @param string $sourceType
     */
    public function setSourceType($sourceType)
    {
        $this->sourceType = $sourceType;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getConsultationStep()
    {
        return $this->consultationStep;
    }

    /**
     * @param mixed $consultationStep
     */
    public function setConsultationStep($consultationStep)
    {
        $this->consultationStep = $consultationStep;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getElements()
    {
        return $this->elements;
    }

    /**
     * @param mixed $element
     */
    public function addElement(SynthesisElement $element)
    {
        if (!$this->elements->contains($element)) {
            $this->elements[] = $element;
            $element->setSynthesis($this);
        }

        return $this;
    }

    /**
     * @param mixed $element
     */
    public function removeElement(SynthesisElement $element)
    {
        $this->elements->removeElement($element);

        return $this;
    }

    /**
     * @return string
     */
    public function getDisplayRules()
    {
        return $this->displayRules;
    }

    public function setDisplayRules($displayRules): self
    {
        $this->displayRules = $displayRules;

        return $this;
    }

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PrePersist
     */
    public function init()
    {
        if (null === $this->sourceType) {
            $this->sourceType = 'none';
        }
        if (null === $this->elements) {
            $this->elements = new ArrayCollection();
        }
    }
}
