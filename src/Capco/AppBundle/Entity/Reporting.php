<?php
namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\CreatableInterface;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\UserBundle\Entity\User;
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Reports")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Opinion;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="reports")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Source;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Reports")
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Argument;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionVersion", inversedBy="reports")
     * @ORM\JoinColumn(name="opinion_version_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinionVersion;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Comment", inversedBy="Reports")
     * @ORM\JoinColumn(name="comment_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Comment;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="reports")
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

    public function getReporter(): ?User
    {
        return $this->Reporter;
    }

    public function setReporter(User $reporter): self
    {
        $this->Reporter = $reporter;

        return $this;
    }

    public function getOpinion()
    {
        return $this->Opinion;
    }

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

    public function getOpinionVersion()
    {
        return $this->opinionVersion;
    }

    public function setOpinionVersion($opinionVersion)
    {
        $this->opinionVersion = $opinionVersion;

        return $this;
    }

    public function getComment(): ?Comment
    {
        return $this->Comment;
    }

    public function setComment(Comment $Comment): self
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

    public function getIsArchived(): bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): self
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    // ******************* Custom methods *************************

    public function getRelatedObject()
    {
        if (null !== $this->Opinion) {
            return $this->Opinion;
        } elseif (null !== $this->Source) {
            return $this->Source;
        } elseif (null !== $this->Argument) {
            return $this->Argument;
        } elseif (null !== $this->Comment) {
            return $this->Comment;
        } elseif (null !== $this->opinionVersion) {
            return $this->opinionVersion;
        } elseif (null !== $this->proposal) {
            return $this->proposal;
        }
    }

    // ***************************** Lifecycle *******************************

    /**
     * @ORM\PreRemove
     */
    public function deleteReport()
    {
        if (null !== $this->Opinion) {
            $this->Opinion->removeReport($this);
        }

        if (null !== $this->Source) {
            $this->Source->removeReport($this);
        }

        if (null !== $this->Argument) {
            $this->Argument->removeReport($this);
        }

        if (null !== $this->Comment) {
            $this->Comment->removeReport($this);
        }

        if (null !== $this->proposal) {
            $this->proposal->removeReport($this);
        }
    }
}
