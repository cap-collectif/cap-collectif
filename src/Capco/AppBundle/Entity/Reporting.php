<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Reporting
 *
 * @ORM\Table(name="reporting")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class Reporting
{
    const SIGNALEMENT_SEX = 0;
    const SIGNALEMENT_OFF = 1;
    const SIGNALEMENT_SPAM = 2;
    const SIGNALEMENT_ERROR = 3;
    const SIGNALEMENT_OFF_TOPIC = 4;

    public static $statusesLabels = [
        self::SIGNALEMENT_SEX => 'reporting.status.sexual',
        self::SIGNALEMENT_OFF => 'reporting.status.offending',
        self::SIGNALEMENT_SPAM => 'reporting.status.spam',
        self::SIGNALEMENT_ERROR => 'reporting.status.error',
        self::SIGNALEMENT_OFF_TOPIC => 'reporting.status.off_topic',
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
     * @var integer
     *
     * @ORM\Column(name="status", type="integer")
     */
    private $status;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"status", "body", "Reporter", "Opinion", "Source", "Argument", "Idea"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="reporter_id", referencedColumnName="id")
     */
    private $Reporter;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Reports")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id")
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="Reports")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id")
     */
    private $Source;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Reports")
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id")
     */
    private $Argument;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="Reports")
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id")
     */
    private $Idea;

    function __construct()
    {
        $this->updatedAt = new \Datetime;
    }

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_archived", type="boolean")
     */
    private $isArchived = false;

    /**
     * @return boolean
     */
    public function getIsArchived()
    {
        return $this->isArchived;
    }

    /**
     * @param boolean $isArchived
     */
    public function setIsArchived($isArchived)
    {
        $this->isArchived = $isArchived;
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
     * Set status
     *
     * @param integer $status
     * @return Reporting
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return integer
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param string $body
     */
    public function setBody($body)
    {
        $this->body = $body;
    }

    /**
     * @return mixed
     */
    public function getReporter()
    {
        return $this->Reporter;
    }

    /**
     * @param mixed $reporter
     */
    public function setReporter($reporter)
    {
        $this->Reporter = $reporter;
    }

    /**
     * @return mixed
     */
    public function getOpinion()
    {
        return $this->Opinion;
    }

    /**
     * @param mixed $Opinion
     */
    public function setOpinion($Opinion)
    {
        if($this->Opinion != null) {
            $this->Opinion->removeReport($this);
        }
        $this->Opinion = $Opinion;
        $this->Opinion->addReport($this);
        return $this;
    }

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->Source;
    }

    /**
     * @param mixed $Source
     */
    public function setSource($Source)
    {
        if($this->Source != null) {
            $this->Source->removeReport($this);
        }
        $this->Source = $Source;
        $this->Source->addReport($this);
        return $this;
    }

    /**
     * @return mixed
     */
    public function getArgument()
    {
        return $this->Argument;
    }

    /**
     * @param mixed $Argument
     */
    public function setArgument($Argument)
    {
        if($this->Argument != null) {
            $this->Argument->removeReport($this);
        }
        $this->Argument = $Argument;
        $this->Argument->addReport($this);
        return $this;
    }

    /**
     * @return mixed
     */
    public function getIdea()
    {
        return $this->Idea;
    }

    /**
     * @param mixed $Idea
     */
    public function setIdea($Idea)
    {
        if($this->Idea != null) {
            $this->Idea->removeReport($this);
        }
        $this->Idea = $Idea;
        $this->Idea->addReport($this);
        return $this;
    }

    public function getRelatedObject(){
        if ($this->Opinion != null) {
            return $this->Opinion;
        } elseif ($this->Source != null) {
            return $this->Source;
        } elseif ($this->Argument != null) {
            return $this->Argument;
        } elseif ($this->Idea != null) {
            return $this->Idea;
        }
        return null;
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteReport()
    {
        if ($this->Opinion != null) {
            $this->Opinion->removeReport($this);
        }
        if ($this->Source != null) {
            $this->Source->removeReport($this);
        }
        if ($this->Argument != null) {
            $this->Argument->removeReport($this);
        }
        if ($this->Idea != null) {
            $this->Idea->removeReport($this);
        }

    }


}
