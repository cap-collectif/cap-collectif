<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\DateHelperTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use JMS\Serializer\Annotation as Serializer;

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
 *      "synthesis" = "SynthesisStep",
 *      "ranking" = "RankingStep",
 * })
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\Discriminator(field = "step_type", map = {
 *      "consultation"     = "Capco\AppBundle\Entity\ConsultationStep",
 *      "presentation"  = "Capco\AppBundle\Entity\PresentationStep",
 *      "other"  = "Capco\AppBundle\Entity\OtherStep",
 *      "synthesis" = "Capco\AppBundle\Entity\SynthesisStep",
 *      "ranking" = "Capco\AppBundle\Entity\RankingStep",
 * })
 */
abstract class AbstractStep
{
    use DateHelperTrait;

    /**
     * @var array
     */
    public static $stepStatus = [
        'closed' => 'step.status.closed',
        'open' => 'step.status.open',
        'future' => 'step.status.future',
    ];

    /**
     * @var array
     */
    public static $stepTypeLabels = [
        'presentation' => 'step.types.presentation',
        'consultation' => 'step.types.consultation',
        'other' => 'step.types.other',
        'synthesis' => 'step.types.synthesis',
        'ranking' => 'step.types.ranking',
    ];

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @Serializer\Expose
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
     * @Gedmo\Slug(fields={"title"}, updatable=false)
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
     * @var \DateTime
     *
     * @ORM\Column(name="start_at", type="datetime", nullable=true)
     */
    private $startAt = null;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt = null;

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
     * Get startAt.
     *
     * @return \DateTime
     */
    public function getStartAt()
    {
        return $this->startAt;
    }

    /**
     * Set startAt.
     *
     * @param \DateTime $startAt
     */
    public function setStartAt($startAt)
    {
        $this->startAt = $startAt;
    }

    /**
     * Get endAt.
     *
     * @return \DateTime
     */
    public function getEndAt()
    {
        return $this->endAt;
    }

    /**
     * Set endAt.
     *
     * @param \DateTime $endAt
     */
    public function setEndAt($endAt)
    {
        $this->endAt = $endAt;
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
        if ($this->consultationAbstractStep) {
            return $this->consultationAbstractStep->getConsultation();
        }

        return;
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

    public function isSynthesisStep()
    {
        return false;
    }

    public function isRankingStep()
    {
        return false;
    }

    public function getRemainingDays()
    {
        $now = new \DateTime();
        if ($this->isOpen()) {
            if (null != $this->endAt) {
                return $this->endAt->diff($now)->format('%a');
            }

            return null != $this->startAt ? $this->startAt->diff($now)->format('%a') : null;
        }

        return;
    }

    public function lastOneDay()
    {
        if ($this->endAt != null && $this->startAt != null) {
            return $this->isSameDate($this->startAt, $this->endAt);
        }

        return false;
    }

    public function isOpen()
    {
        $now = new \DateTime();

        if ($this->startAt !== null && $this->endAt !== null) {
            return $this->startAt < $now && $this->endAt > $now;
        }

        return false;
    }

    public function isClosed()
    {
        $now = new \DateTime();

        if (null == $this->endAt) {
            return $this->startAt !== null && $this->startAt < $now;
        }
        if ($this->endAt < $now) {
            return $this->startAt === null || $this->startAt < $now;
        }

        return false;
    }

    public function isFuture()
    {
        $now = new \DateTime();

        if (null === $this->startAt) {
            return $this->endAt !== null && $this->endAt > $now;
        }
        if ($this->startAt > $now) {
            return $this->endAt === null || $this->endAt > $now;
        }

        return false;
    }

    /**
     * @return int|null
     */
    public function getOpeningStatus()
    {
        if ($this->isFuture()) {
            return 'future';
        }
        if ($this->isClosed()) {
            return 'closed';
        }
        if ($this->isOpen()) {
            return 'open';
        }

        return;
    }
}
