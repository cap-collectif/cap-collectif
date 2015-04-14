<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * Consultation.
 *
 * @ORM\Table(name="consultation")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Consultation
{
    const FILTER_ALL = 'all';

    const SORT_ORDER_CREATED_AT = 0;
    const SORT_ORDER_VOTES_COUNT = 1;

    public static $sortOrder = [
        'date' => self::SORT_ORDER_CREATED_AT,
        'popularity' => self::SORT_ORDER_VOTES_COUNT,
    ];
    public static $sortOrderLabels = [
        'date' => 'idea.sort.created_at',
        'popularity' => 'idea.sort.popularity',
    ];

    const OPENING_STATUS_FUTURE = 0;
    const OPENING_STATUS_OPENED = 1;
    const OPENING_STATUS_ENDED = 2;

    public static $openingStatuses = [
        'future' => self::OPENING_STATUS_FUTURE,
        'opened' => self::OPENING_STATUS_OPENED,
        'ended' => self::OPENING_STATUS_ENDED,
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
     * @ORM\Column(name="title", type="string", length=100)
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
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "teaser", "body", "Author", "Themes", "Steps", "Media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var int
     *
     * @ORM\Column(name="opinion_count", type="integer")
     */
    private $opinionCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_opinion_count", type="integer")
     */
    private $trashedOpinionCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="argument_count", type="integer")
     */
    private $argumentCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_argument_count", type="integer")
     */
    private $trashedArgumentCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="sources_count", type="integer")
     */
    private $sourcesCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_sources_count", type="integer")
     */
    private $trashedSourceCount = 0;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $Author;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="Consultations", cascade={"persist"})
     * @ORM\JoinTable(name="theme_consultation")
     */
    private $Themes;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="Consultation",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Opinions;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Step", mappedBy="consultation",  cascade={"persist", "remove"}, orphanRemoval = true)
     * @ORM\OrderBy({"position" = "ASC"})
     * @CapcoAssert\HasOnlyOneConsultationStep()
     */
    private $Steps;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="cover_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $Cover;

    /**
     * @ORM\Column(name="video", type="string", nullable = true)
     */
    private $video = null;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\OpinionType")
     * @ORM\JoinTable(name="consultation_types")
     */
    private $allowedTypes;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Event", mappedBy="consultations", cascade={"persist"})
     */
    private $events;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Post", mappedBy="consultations", cascade={"persist"})
     */
    private $posts;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->Themes = new ArrayCollection();
        $this->Opinions = new ArrayCollection();
        $this->Steps = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->posts = new ArrayCollection();
        $this->allowedTypes = new ArrayCollection();
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return 'New consultation';
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
     * @return Consultation
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param $slug
     *
     * @return $this
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
     * @return Consultation
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

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

    /**
     * @return int
     */
    public function getOpinionCount()
    {
        return $this->opinionCount;
    }

    /**
     * @param $opinionCount
     *
     * @return $this
     */
    public function setOpinionCount($opinionCount)
    {
        $this->opinionCount = $opinionCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedOpinionCount()
    {
        return $this->trashedOpinionCount;
    }

    /**
     * @param $trashedOpinionCount
     *
     * @return $this
     */
    public function setTrashedOpinionCount($trashedOpinionCount)
    {
        $this->trashedOpinionCount = $trashedOpinionCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getArgumentCount()
    {
        return $this->argumentCount;
    }

    /**
     * @param $argumentCount
     *
     * @return $this
     */
    public function setArgumentCount($argumentCount)
    {
        $this->argumentCount = $argumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedArgumentCount()
    {
        return $this->trashedArgumentCount;
    }

    /**
     * @param $trashedArgumentCount
     *
     * @return $this
     */
    public function setTrashedArgumentCount($trashedArgumentCount)
    {
        $this->trashedArgumentCount = $trashedArgumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
    }

    /**
     * @param int $sourcesCount
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;
    }

    /**
     * @return int
     */
    public function getTrashedSourceCount()
    {
        return $this->trashedSourceCount;
    }

    /**
     * @param int $trashedSourceCount
     */
    public function setTrashedSourceCount($trashedSourceCount)
    {
        $this->trashedSourceCount = $trashedSourceCount;
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param $Author
     *
     * @return $this
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;

        return $this;
    }

    /**
     * Get themes.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getThemes()
    {
        return $this->Themes;
    }

    /**
     * Add theme.
     *
     * @param \Capco\AppBundle\Entity\Theme $theme
     *
     * @return Consultation
     */
    public function addTheme(Theme $theme)
    {
        if (!$this->Themes->contains($theme)) {
            $this->Themes->add($theme);
        }
        $theme->addConsultation($this);

        return $this;
    }

    /**
     * Remove theme.
     *
     * @param \Capco\AppBundle\Entity\Theme $theme
     *
     * @return $this
     */
    public function removeTheme(Theme $theme)
    {
        $this->Themes->removeElement($theme);
        $theme->removeConsultation($this);

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getOpinions()
    {
        return $this->Opinions;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function addOpinion($opinion)
    {
        if (!$this->Opinions->contains($opinion)) {
            $this->Opinions->add($opinion);
        }

        return $this;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function removeOpinion($opinion)
    {
        $this->Opinions->removeElement($opinion);

        return $this;
    }

    /**
     * Get steps.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSteps()
    {
        return $this->Steps;
    }

    /**
     * Reset steps.
     *
     * @param $steps
     *
     * @return $this
     */
    public function resetSteps()
    {
        $this->Steps = new ArrayCollection();

        return $this;
    }

    /**
     * Add step.
     *
     * @param \Capco\AppBundle\Entity\Step $step
     *
     * @return Consultation
     */
    public function addStep(Step $step)
    {
        if (!$this->Steps->contains($step)) {
            $this->Steps->add($step);
        }

        return $this;
    }

    /**
     * Remove step.
     *
     * @param \Capco\AppBundle\Entity\Step $step
     *
     * @return $this
     */
    public function removeStep(Step $step)
    {
        $this->Steps->removeElement($step);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getCover()
    {
        return $this->Cover;
    }

    /**
     * @param mixed $cover
     */
    public function setCover($cover)
    {
        $this->Cover = $cover;
    }

    /**
     * @return string
     */
    public function getVideo()
    {
        return $this->video;
    }

    /**
     * @param string $video
     */
    public function setVideo($video)
    {
        $this->video = $video;
    }

    /**
     * @return mixed
     */
    public function getAllowedTypes()
    {
        return $this->allowedTypes;
    }

    /**
     * @param $allowedTypes
     *
     * @return $this
     */
    public function setAllowedTypes($allowedTypes)
    {
        $this->allowedTypes = $allowedTypes;

        return $this;
    }

    /**
     * @param $allowedType
     *
     * @return $this
     */
    public function addAllowedType($allowedType)
    {
        if (!$this->allowedTypes->contains($allowedType)) {
            $this->allowedTypes[] = $allowedType;
        }

        return $this;
    }

    /**
     * @param $allowedType
     *
     * @return $this
     */
    public function removeAllowedType($allowedType)
    {
        $this->allowedTypes->removeElement($allowedType);

        return $this;
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getEvents()
    {
        return $this->events;
    }

    /**
     * @param Event $event
     *
     * @return Theme
     */
    public function addEvent(Event $event)
    {
        if (!$this->events->contains($event)) {
            $this->events->add($event);
        }

        return $this;
    }

    /**
     * @param Event $event
     *
     * @return $this
     */
    public function removeEvent(Event $event)
    {
        $this->events->removeElement($event);

        return $this;
    }

    /**
     * Get Posts.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPosts()
    {
        return $this->posts;
    }

    /**
     * Add Post.
     *
     * @param Post $post
     *
     * @return $this
     */
    public function addPost(Post $post)
    {
        if (!$this->posts->contains($post)) {
            $this->posts[] = $post;
        }

        return $this;
    }

    /**
     * Remove post.
     *
     * @param Post $post
     *
     * @return $this
     */
    public function removePost(Post $post)
    {
        $this->posts->removeElement($post);

        return $this;
    }

    // ******************** Custom methods ******************************


    /**
     * @return mixed|null
     */
    public function getFirstStep()
    {
        if (!empty($this->Steps)) {
            $first = $this->Steps[0];
            foreach ($this->Steps as $step) {
                if ($step->getPosition() < $first->getPosition()) {
                    $first = $step;
                }
            }

            return $first;
        }

        return null;
    }

    /**
     * @return mixed|null
     */
    public function getConsultationStep()
    {
        foreach ($this->Steps as $step) {
            if ($step->isConsultationStep()) {
                return $step;
            }
        }

        return null;
    }

    /**
     */
    public function getOpenedAt()
    {
        $consultationStep = $this->getConsultationStep();
        if (null != $consultationStep) {
            return $consultationStep->getStartAt();
        }

        return null;
    }

    /**
     */
    public function getClosedAt()
    {
        $consultationStep = $this->getConsultationStep();
        if (null != $consultationStep) {
            return $consultationStep->getEndAt();
        }

        return null;
    }

    /**
     */
    public function getRemainingDays()
    {
        if (null === $consultationStep = $this->getConsultationStep()) {
            return;
        }

        return $consultationStep->getRemainingDays();
    }

    /**
     * Verify if a consultation is opened.
     *
     * @return bool
     */
    public function isOpen()
    {
        if (null === $consultationStep = $this->getConsultationStep()) {
            return false;
        }

        return $consultationStep->isOpen();
    }

    /**
     * Verify if a consultation is future.
     *
     * @return bool
     */
    public function isFuture()
    {
        if (null === $consultationStep = $this->getConsultationStep()) {
            return false;
        }

        return $consultationStep->isFuture();
    }

    /**
     * Verify if a consultation is closed.
     *
     * @return bool
     */
    public function isClosed()
    {
        if (null === $consultationStep = $this->getConsultationStep()) {
            return false;
        }

        return $consultationStep->isClosed();
    }

    /**
     * @return int|null
     */
    public function getOpeningStatus()
    {
        $consultationStep = $this->getConsultationStep();
        if ($this->isClosed()) {
            return self::OPENING_STATUS_ENDED;
        }
        if ($this->isFuture()) {
            return self::OPENING_STATUS_FUTURE;
        }
        if ($this->isOpen()) {
            return self::OPENING_STATUS_OPENED;
        }

        return null;
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled;
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->isEnabled && ($this->getOpeningStatus() == $this::OPENING_STATUS_OPENED);
    }

    /**
     * @return int
     */
    public function getTotalContributionsCount()
    {
        return $this->argumentCount + $this->opinionCount + $this->trashedArgumentCount + $this->trashedOpinionCount;
    }

    /**
     * @param $opinionType
     *
     * @return bool
     */
    public function allowType($opinionType)
    {
        return $this->allowedTypes->contains($opinionType);
    }

    public function setConsultationType(ConsultationType $consultationType)
    {
        $this->allowedTypes = $consultationType->getOpinionTypes();
    }

    /**
     * Required for sonata admin.
     */
    public function getConsultationType()
    {
        return null;
    }

    // ************************** Lifecycle **************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteConsultation()
    {
        if ($this->Themes->count() > 0) {
            foreach ($this->Themes as $theme) {
                $theme->removeConsultation($this);
            }
        }
    }
}
