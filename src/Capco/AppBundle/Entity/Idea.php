<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Idea
 *
 * @ORM\Table(name="idea")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaRepository")
 */
class Idea
{
    const SORT_ORDER_CREATED_AT = 0;
    const SORT_ORDER_VOTES_COUNT = 1;

    public static $openingStatuses = [
        'date' => self::SORT_ORDER_CREATED_AT,
        'popularity' => self::SORT_ORDER_VOTES_COUNT,
    ];
    public static $openingStatusesLabels = [
        'date' => 'idea.sort.created_at',
        'popularity' => 'idea.sort.popularity',
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
     * @Assert\Length(min=3)
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="change", field={"title", "body", "Theme", "Author", "Media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count", type="integer")
     */
    private $voteCount = 0;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="Ideas")
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id", nullable=true)
     */
    private $Theme = null;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id")
     */
    private $Media;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Idea", cascade={"persist", "remove"})
     */
    private $Reports;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\IdeaVote", mappedBy="Idea", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $IdeaVotes;

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

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New idea";
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
     * Set title
     *
     * @param string $title
     * @return Idea
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
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
     * Set slug
     *
     * @param string $slug
     * @return Idea
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

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
     * Set body
     *
     * @param string $body
     * @return Idea
     */
    public function setBody($body)
    {
        $this->body = $body;

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
     * Set voteCount
     *
     * @param integer $voteCount
     * @return Idea
     */
    public function setVoteCount($voteCount)
    {
        $this->voteCount = $voteCount;

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
     * @return mixed
     */
    public function getTheme()
    {
        return $this->Theme;
    }

    /**
     * @param mixed $Theme
     */
    public function setTheme($Theme)
    {
        $this->Theme = $Theme;
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
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * @param mixed $media
     */
    public function setMedia($media)
    {
        $this->Media = $media;
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->IdeaVotes = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->voteCount = 0;
        $this->updatedAt = new \Datetime;
    }

    /**
     * Set isEnabled
     *
     * @param boolean $isEnabled
     *
     * @return Idea
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

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
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return Idea
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return Idea
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Set isTrashed
     *
     * @param boolean $isTrashed
     * @return Idea
     */
    public function setIsTrashed($isTrashed)
    {
        $this->isTrashed = $isTrashed;

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
     * Set trashedAt
     *
     * @param \DateTime $trashedAt
     * @return Idea
     */
    public function setTrashedAt($trashedAt)
    {
        $this->trashedAt = $trashedAt;

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
     * Set trashedReason
     *
     * @param string $trashedReason
     * @return Idea
     */
    public function setTrashedReason($trashedReason)
    {
        $this->trashedReason = $trashedReason;

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
     * Add ideaVote
     *
     * @param \Capco\AppBundle\Entity\IdeaVote $ideaVote
     *
     * @return Idea
     */
    public function addIdeaVote(\Capco\AppBundle\Entity\IdeaVote $ideaVote)
    {
        $this->IdeaVotes->add($ideaVote);
        $this->voteCount++;
        $ideaVote->setIdea($this);
        return $this;
    }

    /**
     * Remove ideaVote
     *
     * @param \Capco\AppBundle\Entity\IdeaVote $ideaVote
     */
    public function removeIdeaVote(\Capco\AppBundle\Entity\IdeaVote $ideaVote)
    {
        if($this->IdeaVotes->removeElement($ideaVote)){
            $this->voteCount--;
            $ideaVote->setIdea(null);
        }
        return $this;
    }

    /**
     * Get ideaVotes
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getIdeaVotes()
    {
        return $this->IdeaVotes;
    }

    public function resetIdeaVotes() {
        foreach($this->IdeaVotes as $vote){
            $vote->setIdea(null);
        }
        $this->voteCount = 0;
        $this->setIdeaVotes(new ArrayCollection());
        return $this;
    }

    public function setIdeaVotes($votes){
        foreach($votes as $vote){
            $vote->setIdea($this);
        }
        $this->IdeaVotes = $votes;
        $this->voteCount = $votes->count();
        return $this;
    }

    /**
     *
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
        $this->Reports[] = $report;

        return $this;
    }

    /**
     * @param Reporting $report
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);
    }

    public function canDisplay() {
        return ($this->isEnabled);
    }

    public function canContribute() {
        return ($this->isEnabled() && !$this->isTrashed);
    }

    public function getExcerpt($nb = 100){
        $excerpt = substr($this->body, 0, $nb);
        $excerpt = $excerpt.'...';
        return $excerpt;
    }
}
