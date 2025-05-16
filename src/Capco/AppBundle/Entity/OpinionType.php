<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\Text\DescriptionTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="opinion_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionTypeRepository")
 */
class OpinionType implements EntityInterface, \Stringable
{
    use DescriptionTrait;
    use UuidTrait;

    final public const VOTE_WIDGET_DISABLED = 0;
    final public const VOTE_WIDGET_OK = 1;
    final public const VOTE_WIDGET_BOTH = 2;

    final public const COMMENT_SYSTEM_DISABLED = 0;
    final public const COMMENT_SYSTEM_OK = 1;
    final public const COMMENT_SYSTEM_BOTH = 2;

    public static $colorsType = [
        'opinion_type.colors.white' => 'white',
        'global.red' => 'red',
        'global.green' => 'green',
        'opinion_type.colors.blue' => 'blue',
        'global.orange' => 'orange',
        'opinion_type.colors.bluedark' => 'bluedark',
        'opinion_type.colors.default' => 'default',
    ];

    public static $voteWidgetLabels = [
        'global.none' => self::VOTE_WIDGET_DISABLED,
        'opinion_type.widget_type.both' => self::VOTE_WIDGET_BOTH,
    ];

    public static $commentSystemLabels = [
        'opinion_type.comment_system.disabled' => self::COMMENT_SYSTEM_DISABLED,
        'opinion_type.comment_system.ok' => self::COMMENT_SYSTEM_OK,
        'opinion_type.comment_system.both' => self::COMMENT_SYSTEM_BOTH,
    ];

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionTypeAppendixType", mappedBy="opinionType",  orphanRemoval=true, cascade={"persist", "remove"})
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $appendixTypes;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="children", cascade={"persist"})
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $parent;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="parent", cascade={"persist"})
     */
    protected $children;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="opinionTypes", cascade={"persist"})
     * @ORM\JoinColumn(name="consultation_id", nullable=false, onDelete="CASCADE")
     */
    protected $consultation;

    /**
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @ORM\Column(name="subtitle", type="string", length=255, nullable=true)
     */
    private $subtitle;

    /**
     * @Gedmo\Slug(handlers={
     *  @Gedmo\SlugHandler(class="Gedmo\Sluggable\Handler\TreeSlugHandler", options={
     *      @Gedmo\SlugHandlerOption(name="parentRelationField", value="parent"),
     *      @Gedmo\SlugHandlerOption(name="separator", value="/")
     *  })
     * }, fields={"title", "subtitle"}, unique=false)
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    /**
     * @ORM\Column(name="vote_widget_type", type="integer")
     */
    private $voteWidgetType = self::VOTE_WIDGET_BOTH;

    /**
     * @ORM\Column(name="help_text", type="string", length=255, nullable=true)
     */
    private $votesHelpText;

    /**
     * @ORM\Column(name="comment_system", type="integer")
     */
    private $commentSystem = self::COMMENT_SYSTEM_BOTH;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "subtitle", "position", "voteWidgetType", "color"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="OpinionType", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Opinions;

    /**
     * @ORM\Column(name="color", type="string", length=50)
     */
    private $color;

    /**
     * @ORM\Column(name="default_filter", type="string", length=50)
     */
    private $defaultFilter;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var bool
     *
     * @ORM\Column(name="versionable", type="boolean", options={"default": false})
     */
    private $versionable = false;

    /**
     * @ORM\Column(name="linkable", type="boolean", options={"default": false})
     */
    private $linkable = false;

    /**
     * @var bool
     *
     * @ORM\Column(name="sourceable", type="boolean", options={"default": true})
     */
    private $sourceable = false;

    /**
     * @var int
     *
     * @ORM\Column(name="votes_threshold", type="integer", nullable=true)
     */
    private $votesThreshold;

    /**
     * @var string
     *
     * @ORM\Column(name="threshold_help_text", type="string", length=255, nullable=true)
     */
    private $votesThresholdHelpText;

    public function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_BOTH;
        $this->Opinions = new ArrayCollection();
        $this->updatedAt = new \DateTime();
        $this->appendixTypes = new ArrayCollection();
        $this->children = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New opinion type';
    }

    public function getStep(): ?ConsultationStep
    {
        return $this->getConsultation() ? $this->getConsultation()->getStep() : null;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
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
     * @return OpinionType
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return string
     */
    public function getSubtitle()
    {
        return $this->subtitle;
    }

    /**
     * @param string $subtitle
     */
    public function setSubtitle($subtitle)
    {
        $this->subtitle = $subtitle;
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
     * @return OpinionType
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get position.
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Set position.
     *
     * @param int $position
     *
     * @return OpinionType
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    public function getDefaultFilter(): ?string
    {
        return $this->defaultFilter;
    }

    public function setDefaultFilter(string $defaultFilter): self
    {
        $this->defaultFilter = $defaultFilter;

        return $this;
    }

    /**
     * Get voteWidgetType.
     *
     * @return int
     */
    public function getVoteWidgetType()
    {
        return $this->voteWidgetType;
    }

    /**
     * Set voteWidgetType.
     *
     * @param int $voteWidgetType
     *
     * @return OpinionType
     */
    public function setVoteWidgetType($voteWidgetType)
    {
        $this->voteWidgetType = $voteWidgetType;

        return $this;
    }

    /**
     * @return int
     */
    public function getCommentSystem()
    {
        return $this->commentSystem;
    }

    /**
     * @param int $commentSystem
     */
    public function setCommentSystem($commentSystem)
    {
        $this->commentSystem = $commentSystem;
    }

    /**
     * @return int
     */
    public function getVotesThreshold()
    {
        return $this->votesThreshold;
    }

    /**
     * @param int $votesThreshold
     */
    public function setVotesThreshold($votesThreshold)
    {
        $this->votesThreshold = $votesThreshold;
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
     * @return mixed
     */
    public function getOpinions()
    {
        return $this->Opinions;
    }

    /**
     * @param \Capco\AppBundle\Entity\Opinion $opinion
     *
     * @return $this
     */
    public function addOpinion(Opinion $opinion)
    {
        if (!$this->Opinions->contains($opinion)) {
            $this->Opinions->add($opinion);
        }

        return $this;
    }

    /**
     * @param \Capco\AppBundle\Entity\Opinion $opinion
     *
     * @return $this
     */
    public function removeOpinion(Opinion $opinion)
    {
        $this->Opinions->removeElement($opinion);

        return $this;
    }

    public function getAppendixTypes()
    {
        return $this->appendixTypes;
    }

    public function addAppendixType(OpinionTypeAppendixType $appendixType)
    {
        if (!$this->appendixTypes->contains($appendixType)) {
            $this->appendixTypes->add($appendixType);
            $appendixType->setOpinionType($this);
        }

        return $this;
    }

    public function removeAppendixType(OpinionTypeAppendixType $appendixType)
    {
        $this->appendixTypes->removeElement($appendixType);

        return $this;
    }

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @param string $color
     */
    public function setColor($color): self
    {
        $this->color = $color;

        return $this;
    }

    /**
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * @param bool $isEnabled
     */
    public function setIsEnabled($isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function isVersionable()
    {
        return $this->versionable;
    }

    public function setVersionable($versionable)
    {
        $this->versionable = $versionable;

        return $this;
    }

    public function isLinkable(): bool
    {
        return $this->linkable;
    }

    public function setLinkable(bool $linkable)
    {
        $this->linkable = $linkable;

        return $this;
    }

    public function isSourceable(): bool
    {
        return $this->sourceable;
    }

    public function setSourceable(bool $sourceable)
    {
        $this->sourceable = $sourceable;

        return $this;
    }

    /**
     * @return string
     */
    public function getVotesHelpText()
    {
        return $this->votesHelpText;
    }

    /**
     * @param string $votesHelpText
     */
    public function setVotesHelpText($votesHelpText)
    {
        $this->votesHelpText = $votesHelpText;
    }

    /**
     * @return string
     */
    public function getVotesThresholdHelpText()
    {
        return $this->votesThresholdHelpText;
    }

    /**
     * @param string $votesThresholdHelpText
     */
    public function setVotesThresholdHelpText($votesThresholdHelpText)
    {
        $this->votesThresholdHelpText = $votesThresholdHelpText;
    }

    /**
     * @return mixed
     */
    public function getParent()
    {
        return $this->parent;
    }

    public function setParent(?self $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getChildren()
    {
        return $this->children;
    }

    public function addChild(mixed $child)
    {
        if (!$this->children->contains($child)) {
            $this->children->add($child);
        }
        $child->setParent($this);
    }

    public function removeChild(mixed $child)
    {
        if ($this->children->contains($child)) {
            $this->children->removeElement($child);
        }
        $child->setParent(null);
    }

    public function getConsultation(): ?Consultation
    {
        return $this->consultation;
    }

    public function setConsultation(Consultation $consultation): self
    {
        $this->consultation = $consultation;

        return $this;
    }

    public function isContribuable(): bool
    {
        return $this->isEnabled;
    }

    public function getAllAppendixTypes()
    {
        $types = new ArrayCollection();
        foreach ($this->appendixTypes as $otat) {
            $types->add($otat->getAppendixType());
        }

        return $types;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchOpinionType'];
    }
}
