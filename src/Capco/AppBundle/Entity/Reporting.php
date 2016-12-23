<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\IdTrait;

/**
 * @ORM\Table(name="reporting")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReportingRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Reporting
{
    use IdTrait;

    const SIGNALEMENT_SEX = 0;
    const SIGNALEMENT_OFF = 1;
    const SIGNALEMENT_SPAM = 2;
    const SIGNALEMENT_ERROR = 3;
    const SIGNALEMENT_OFF_TOPIC = 4;

    public static $statusesLabels = [
        self::SIGNALEMENT_SPAM => 'reporting.status.spam',
        self::SIGNALEMENT_OFF => 'reporting.status.offending',
        self::SIGNALEMENT_ERROR => 'reporting.status.error',
        self::SIGNALEMENT_OFF_TOPIC => 'reporting.status.off_topic',
        self::SIGNALEMENT_SEX => 'reporting.status.sexual',
    ];

    /**
     * @var int
     *
     * @ORM\Column(name="status", type="integer")
     * @Assert\NotNull()
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
     * @ORM\JoinColumn(name="reporter_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Reporter;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Source;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Argument;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Idea;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionVersion", inversedBy="reports", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_version_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinionVersion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Comment", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="comment_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Comment;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="reports", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_archived", type="boolean")
     */
    private $isArchived = false;

    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        return $this->getId() ? 'Signalement de '.$this->getRelatedObject() : 'Signalement';
    }

    /**
     * Get status.
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set status.
     *
     * @param int $status
     *
     * @return Reporting
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt.
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

        return $this;
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

        return $this;
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
     *
     * @return $this
     */
    public function setArgument($Argument)
    {
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
        $this->Idea = $Idea;
        $this->Idea->addReport($this);

        return $this;
    }

    public function getOpinionVersion()
    {
        return $this->opinionVersion;
    }

    public function setOpinionVersion($opinionVersion)
    {
        $this->opinionVersion = $opinionVersion;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getComment()
    {
        return $this->Comment;
    }

    /**
     * @param mixed $Comment
     */
    public function setComment($Comment)
    {
        $this->Comment = $Comment;
        $this->Comment->addReport($this);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    /**
     * @param mixed $proposal
     */
    public function setProposal($proposal)
    {
        $this->proposal = $proposal;
        $proposal->addReport($this);

        return $this;
    }

    /**
     * @return bool
     */
    public function getIsArchived()
    {
        return $this->isArchived;
    }

    /**
     * @param bool $isArchived
     */
    public function setIsArchived($isArchived)
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    // ******************* Custom methods *************************

    public function getRelatedObject()
    {
        if ($this->Opinion != null) {
            return $this->Opinion;
        } elseif ($this->Source != null) {
            return $this->Source;
        } elseif ($this->Argument != null) {
            return $this->Argument;
        } elseif ($this->Idea != null) {
            return $this->Idea;
        } elseif ($this->Comment != null) {
            return $this->Comment;
        } elseif ($this->opinionVersion != null) {
            return $this->opinionVersion;
        } elseif ($this->proposal != null) {
            return $this->proposal;
        }

        return;
    }

    // ***************************** Lifecycle *******************************

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

        if ($this->Comment != null) {
            $this->Comment->removeReport($this);
        }

        if ($this->proposal != null) {
            $this->proposal->removeReport($this);
        }
    }
}
