<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\CreatableInterface;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="reporting")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReportingRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Reporting implements CreatableInterface
{
    use IdTrait, TextableTrait;

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
     * @ORM\Column(name="status", type="integer")
     * @Assert\NotNull()
     */
    private $status;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="reporter_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Reporter;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Opinion;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Source;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Argument;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Idea;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionVersion", inversedBy="reports", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_version_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinionVersion;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Comment", inversedBy="Reports", cascade={"persist"})
     * @ORM\JoinColumn(name="comment_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Comment;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="reports", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @ORM\Column(name="is_archived", type="boolean", nullable=false)
     */
    private $isArchived = false;

    public function __toString()
    {
        return $this->getId() ? 'Signalement de ' . $this->getRelatedObject() : 'Signalement';
    }

    public function getKind(): string
    {
        return 'report';
    }

    public function getRelated()
    {
        return $this->getRelatedObject();
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStatus(int $status): self
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
        if ($this->Opinion !== null) {
            return $this->Opinion;
        } elseif ($this->Source !== null) {
            return $this->Source;
        } elseif ($this->Argument !== null) {
            return $this->Argument;
        } elseif ($this->Idea !== null) {
            return $this->Idea;
        } elseif ($this->Comment !== null) {
            return $this->Comment;
        } elseif ($this->opinionVersion !== null) {
            return $this->opinionVersion;
        } elseif ($this->proposal !== null) {
            return $this->proposal;
        }
    }

    // ***************************** Lifecycle *******************************

    /**
     * @ORM\PreRemove
     */
    public function deleteReport()
    {
        if ($this->Opinion !== null) {
            $this->Opinion->removeReport($this);
        }

        if ($this->Source !== null) {
            $this->Source->removeReport($this);
        }

        if ($this->Argument !== null) {
            $this->Argument->removeReport($this);
        }

        if ($this->Idea !== null) {
            $this->Idea->removeReport($this);
        }

        if ($this->Comment !== null) {
            $this->Comment->removeReport($this);
        }

        if ($this->proposal !== null) {
            $this->proposal->removeReport($this);
        }
    }
}
