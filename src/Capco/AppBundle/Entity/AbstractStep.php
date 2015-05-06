<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\StartAndEndDatesTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * AbstractStep.
 *
 * @ORM\Table(name="step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractStepRepository")
 * @CapcoAssert\EndAfterStart()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "step_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "consultation"     = "ConsultationStep",
 *      "presentation"  = "PresentationStep",
 *      "other"  = "OtherStep",
 * })
 */
abstract class AbstractStep
{
    use StartAndEndDatesTrait;

    public static $stepStatus = [
        'closed' => 'step.status.closed',
        'open' => 'step.status.open',
        'future' => 'step.status.future',
    ];

    public static $stepTypeLabels = [
        'presentation' => 'step.types.presentation',
        'consultation' => 'step.types.consultation',
        'other' => 'step.types.other',
    ];

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * Needed by sonata admin.
     *
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ConsultationAbstractStep", mappedBy="step", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $consultationAbstractStep;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body = null;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "startAt", "endAt", "position", "type", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return 'New step';
        }
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return AbstractStep
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get slug.
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set slug.
     *
     * @param string $slug
     *
     * @return AbstractStep
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return AbstractStep
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getConsultationAbstractStep()
    {
        return $this->consultationAbstractStep;
    }

    /**
     * @param mixed $consultationAbstractStep
     */
    public function setConsultationAbstractStep($consultationAbstractStep)
    {
        $this->consultationAbstractStep = $consultationAbstractStep;
    }

    /**
     * Get body.
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * Set body.
     *
     * @return AbstractStep
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    // ************************* Custom methods *********************

    /**
     * Get consultation.
     *
     * @return string
     */
    public function getConsultation()
    {
        return $this->consultationAbstractStep->getConsultation();
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled && $this->getConsultation()->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->getConsultation()->canContribute() && $this->isEnabled && $this->isOpen();
    }

    public function getType()
    {
        return;
    }

    public function isConsultationStep()
    {
        return false;
    }

    public function isPresentationStep()
    {
        return false;
    }

    public function isOtherStep()
    {
        return false;
    }
}
