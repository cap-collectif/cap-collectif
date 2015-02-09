<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

use Capco\AppBundle\Entity\Consultation;

/**
 * Step
 *
 * @ORM\Table(name="step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\StepRepository")
 */
class Step
{

    const TYPE_OTHER = 0;
    const TYPE_CONSULTATION = 1;

    public static $stepTypes = [
        'consultation' => self::TYPE_CONSULTATION,
        'other' => self::TYPE_OTHER,
    ];

    public static $stepTypeLabels = [
        self::TYPE_CONSULTATION => 'Consultation',
        self::TYPE_OTHER => 'Autre',
    ];

    public static $stepTypeLabelsNoConsultation = [
        self::TYPE_OTHER => 'Autre',
    ];

    public static $stepStatus = [
        'closed' => 'step.status.closed',
        'open' => 'step.status.open',
        'future' => 'step.status.future'
    ];

    /**
     * @var integer
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
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="start_at", type="datetime")
     */
    private $startAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_at", type="datetime")
     */
    private $endAt;

    /**
     * @var integer
     *
     * @ORM\Column(name="position", type="integer")
     */
    private $position;


    /**
     * @var integer
     *
     * @ORM\Column(name="type", type="integer")
     */
    private $type = self::TYPE_OTHER;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="Steps", cascade={"persist"})
     * @ORM\JoinColumn(nullable=true)
     */
    private $consultation = null;

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
     * @Gedmo\Timestampable(on="change", field={"title", "startAt", "endAt", "position", "type", "consultation", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime;
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New step";
        }
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Step
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set slug
     *
     * @param string $slug
     * @return Step
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get startAt
     *
     * @return \DateTime
     */
    public function getStartAt()
    {
        return $this->startAt;
    }

    /**
     * Set startAt
     *
     * @param \DateTime $startAt
     * @return Step
     */
    public function setStartAt($startAt)
    {
        $this->startAt = $startAt;

        return $this;
    }

    /**
     * Get endAt
     *
     * @return \DateTime
     */
    public function getEndAt()
    {
        return $this->endAt;
    }

    /**
     * Set endAt
     *
     * @param \DateTime $endAt
     * @return Step
     */
    public function setEndAt($endAt)
    {
        $this->endAt = $endAt;

        return $this;
    }

    /**
     * Get position
     *
     * @return integer
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Set position
     *
     * @param integer $position
     * @return Step
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get type
     *
     * @return integer
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set type
     *
     * @param integer $type
     * @return Step
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get isEnabled
     *
     * @return boolean
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isEnabled
     *
     * @param boolean $isEnabled
     * @return Step
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get consultation
     *
     * @return string
     */
    public function getConsultation()
    {
        return $this->consultation;
    }

    /**
     * @param string $consultation
     * @return $this
     */
    public function setConsultation(Consultation $consultation = null)
    {
        $this->consultation = $consultation;
        $this->consultation->addStep($this);
        return $this;
    }

    /**
     * Get body
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * Set body
     *
     * @return Step
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

    // ********************** custom Methods *******************************

    /**
     * @return boolean
     */
    public function isConsultationStep(){
        if($this->type == self::TYPE_CONSULTATION){
            return true;
        }
        return false;
    }

    /**
     * @return boolean
     */
    public function isOtherStep(){
        if($this->type == self::TYPE_OTHER){
            return true;
        }
        return false;
    }

    // ************************* Lifecycle **************************

    /**
     * @ORM\PreRemove
     */
    public function deleteStep()
    {
        if ($this->consultation != null) {
            $this->consultation->removeStep($this);
        }

    }

}
