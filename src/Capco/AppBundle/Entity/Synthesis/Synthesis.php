<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Traits\UuidTrait;

/**
 * Synthesis.
 *
 * @ORM\Table(name="synthesis")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Synthesis\SynthesisRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 * @CapcoAssert\ConsultationStepExists()
 */
class Synthesis
{
    const SOURCE_TYPE_NONE = 'none';
    const SOURCE_TYPE_CONSULTATION = 'consultation_step';

    public static $sourceTypesLabels = [
        self::SOURCE_TYPE_CONSULTATION => 'synthesis.source_types.consultation_step',
        self::SOURCE_TYPE_NONE => 'synthesis.source_types.none',
    ];

    use UuidTrait;

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
    private $consultationStep = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="synthesis", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $elements;

    /**
     * @var \DateTime
     * @ORM\Column(name="deleted_at", type="datetime", nullable=true)
     */
    private $deletedAt;

    /**
     * @var string
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
     * @return mixed
     */
    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    /**
     * @param mixed $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
    }

    /**
     * @return string
     */
    public function getDisplayRules()
    {
        return $this->displayRules;
    }

    /**
     * @param string $displayRules
     *
     * @return $this
     */
    public function setDisplayRules($displayRules)
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
        if ($this->sourceType === null) {
            $this->sourceType = 'none';
        }
        if ($this->elements === null) {
            $this->elements = new ArrayCollection();
        }
    }
}
