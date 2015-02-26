<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * Comment
 *
 * @ORM\Table(name="comment")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CommentRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAuthor
 */
class Comment
{

    public static $sortCriterias = [
        'date' => 'argument.sort.date',
        'popularity' => 'argument.sort.popularity',
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
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank(message="comment.create.no_body_error")
     */
    private $body;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count", type="integer")
     */
    private $voteCount = 0;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\Column(name="author_name", type="string", nullable=true)
     */
    private $authorName;

    /**
     * @var
     *
     * @ORM\Column(name="author_email", type="string", nullable=true)
     * @Assert\Email(checkMX = true, message="comment.create.invalid_email_error")
     */
    private $authorEmail;

    /**
     * @var
     *
     * @ORM\Column(name="author_ip", type="string", nullable=true)
     * @Assert\Ip
     */
    private $authorIp;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\CommentVote", mappedBy="comment", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Votes;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Idea;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Comment", cascade={"persist", "remove"})
     */
    private $Reports;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt = null;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    function __construct()
    {
        $this->Votes = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->updatedAt = new \Datetime();
        $this->voteCount = 0;
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getBodyExcerpt(50);
        } else {
            return "New comment";
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
     * @param string $body
     * @return Argument
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
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
     * @return Argument
     */
    public function setIsEnabled($isEnabled)
    {
        if ($isEnabled != $this->isEnabled) {
            if ($isEnabled) {
                if (!$this->isTrashed) {
                    if (null != $this->Idea) {
                        $this->Idea->increaseCommentsCount(1);
                    }
                }
            } else {
                if (!$this->isTrashed) {
                    if (null != $this->Idea) {
                        $this->Idea->decreaseCommentsCount(1);
                    }
                }
            }
        }
        $this->isEnabled = $isEnabled;
        return $this;
    }

    /**
     * Get voteCount
     *
     * @return integer
     */
    public function getVoteCount()
    {
        return $this->voteCount;
    }

    /**
     * Set voteCount
     *
     * @param integer $voteCount
     * @return Argument
     */
    public function setVoteCount($voteCount)
    {
        $this->voteCount = $voteCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param mixed $Author
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;
    }

    /**
     * @return mixed
     */
    public function getAuthorName()
    {
        return $this->authorName;
    }

    /**
     * @param mixed $authorName
     */
    public function setAuthorName($authorName)
    {
        $this->authorName = $authorName;
    }

    /**
     * @return mixed
     */
    public function getAuthorEmail()
    {
        return $this->authorEmail;
    }

    /**
     * @param mixed $authorEmail
     */
    public function setAuthorEmail($authorEmail)
    {
        $this->authorEmail = $authorEmail;
    }

    /**
     * @return mixed
     */
    public function getAuthorIp()
    {
        return $this->authorIp;
    }

    /**
     * @param mixed $authorIp
     */
    public function setAuthorIp($authorIp)
    {
        $this->authorIp = $authorIp;
    }

    /**
     * @return ArrayCollection
     */
    public function getVotes(){
        return $this->Votes;
    }

    /**
     * @param $vote
     * @return $this
     */
    public function addVote($vote){
        if (!$this->Votes->contains($vote)) {
            $this->voteCount++;
            $this->Votes->add($vote);
        }
        return $this;
    }

    /**
     * @param $vote
     * @return $this
     */
    public function removeVote($vote)
    {
        if ($this->Votes->removeElement($vote)) {
            $this->voteCount--;
        }
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
        $Idea->addComment($this);
    }

    /**
     * @return string
     */
    public function getReports()
    {
        return $this->Reports;
    }

    /**
     * @param Reporting $report
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }
        return $this;
    }

    /**
     * @param Reporting $report
     * @return $this
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);
        return $this;
    }

    /**
     * Get isTrashed
     *
     * @return boolean
     */
    public function getIsTrashed()
    {
        return $this->isTrashed;
    }

    /**
     * Set isTrashed
     *
     * @param boolean $isTrashed
     * @return Argument
     */
    public function setIsTrashed($isTrashed)
    {
        if ($isTrashed != $this->isTrashed) {
            if ($isTrashed == false) {
                $this->trashedReason = null;
                $this->trashedAt = null;
            }
            if($this->isEnabled) {
                if ($isTrashed) {
                    if (null != $this->Idea) {
                        $this->Idea->decreaseCommentsCount(1);
                    }
                } else {
                    if (null != $this->Idea) {
                        $this->Idea->increaseCommentsCount(1);
                    }
                }
            }
        }
        $this->isTrashed = $isTrashed;
        return $this;
    }

    /**
     * Get trashedAt
     *
     * @return \DateTime
     */
    public function getTrashedAt()
    {
        return $this->trashedAt;
    }

    /**
     * Set trashedAt
     *
     * @param \DateTime $trashedAt
     * @return Argument
     */
    public function setTrashedAt($trashedAt)
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    /**
     * Get trashedReason
     *
     * @return string
     */
    public function getTrashedReason()
    {
        return $this->trashedReason;
    }

    /**
     * Set trashedReason
     *
     * @param string $trashedReason
     * @return Argument
     */
    public function setTrashedReason($trashedReason)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    // ************************ Custom methods *********************************

    /**
     * @return $this
     */
    public function resetVotes()
    {
        foreach ($this->Votes as $vote) {
            $this->removeVote($vote);
        }
        return $this;
    }

    /**
     * @param User $user
     * @return bool
     */
    public function userHasVote(User $user = null)
    {
        if ($user != null) {
            foreach($this->Votes as $vote){
                if($vote->getVoter() == $user){
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param User $user
     * @return bool
     */
    public function userHasReport(User $user = null)
    {
        if ($user != null) {
            foreach($this->Reports as $report){
                if($report->getReporter() == $user){
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @return bool
     */
    public function canDisplay() {
        if (null != $this->Idea) {
            return ($this->isEnabled && $this->Idea->canDisplay());
        }
        return false;
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        if (null != $this->Idea) {
            return ($this->isEnabled && !$this->isTrashed && $this->Idea->canContribute());
        }
        return false;
    }

    /**
     * @param int $nb
     * @return string
     */
    public function getBodyExcerpt($nb = 100)
    {
        $excerpt = substr($this->body, 0, $nb);
        $excerpt = $excerpt.'...';
        return $excerpt;
    }


    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteComment()
    {
        if (null != $this->Idea) {
            $this->Idea->removeComment($this);
        }

    }
}
