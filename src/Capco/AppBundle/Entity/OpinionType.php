<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * OpinionType.
 *
 * @ORM\Table(name="opinion_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionTypeRepository")
 */
class OpinionType
{
    public static $colorsType = [
        'red' => 'opinion_type.colors.red',
        'green' => 'opinion_type.colors.green',
        'blue' => 'opinion_type.colors.blue',
        'orange' => 'opinion_type.colors.orange',
        'bluedark' => 'opinion_type.colors.bluedark',
        'white' => 'opinion_type.colors.white',
        'default' => 'opinion_type.colors.default',
    ];

    const VOTE_WIDGET_DISABLED = 0;
    const VOTE_WIDGET_OK = 1;
    const VOTE_WIDGET_BOTH = 2;

    public static $voteWidgetLabels = [
        self::VOTE_WIDGET_DISABLED => 'opinion.show.vote.widget_type.disabled',
        self::VOTE_WIDGET_OK => 'opinion.show.vote.widget_type.ok',
        self::VOTE_WIDGET_BOTH => 'opinion.show.vote.widget_type.both',
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
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="short_name", type="string", length=255)
     */
    private $shortName;

    /**
     * @Gedmo\Slug(fields={"shortName"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_widget_type", type="integer")
     */
    private $voteWidgetType = self::VOTE_WIDGET_BOTH;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "shortName", "position", "voteWidgetType", "color"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="OpinionType", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Opinions;

    /**
     * @var string
     *
     * @ORM\Column(name="color", type="string", length=50)
     */
    private $color;

    /**
     * @var string
     *
     * @ORM\Column(name="default_filter", type="string", length=50)
     */
    private $defaultFilter;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled;

    /**
     * @var bool
     *
     * @ORM\Column(name="versionable", type="boolean")
     */
    private $versionable = false;

    /**
     * @var bool
     *
     * @ORM\Column(name="sourceable", type="boolean")
     */
    private $sourceable = true;

    /**
     * @var string
     *
     * @ORM\Column(name="help_text", type="string", length=255, nullable=true)
     */
    private $helpText = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionTypeAppendixType", mappedBy="opinionType",  cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $appendixTypes;

    public function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_BOTH;
        $this->Opinions = new ArrayCollection();
        $this->updatedAt = new \Datetime();
        $this->appendixTypes = new ArrayCollection();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New opinion type';
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
     * Get shortName.
     *
     * @return string
     */
    public function getShortName()
    {
        return $this->shortName;
    }

    /**
     * Set shortName.
     *
     * @param string $shortName
     *
     * @return OpinionType
     */
    public function setShortName($shortName)
    {
        $this->shortName = $shortName;

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

    /**
     * Get defaultFilter.
     *
     * @return int
     */
    public function getDefaultFilter()
    {
        return $this->defaultFilter;
    }

    /**
     * Set defaultFilter.
     *
     * @param int $defaultFilter
     *
     * @return OpinionType
     */
    public function setDefaultFilter($defaultFilter)
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
    public function setColor($color)
    {
        $this->color = $color;
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
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;
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

    /**
     * @return boolean
     */
    public function isSourceable()
    {
        return $this->sourceable;
    }

    /**
     * @param boolean $sourceable
     */
    public function setSourceable($sourceable)
    {
        $this->sourceable = $sourceable;
    }

    /**
     * @return string
     */
    public function getHelpText()
    {
        return $this->helpText;
    }

    /**
     * @param string $helpText
     */
    public function setHelpText($helpText)
    {
        $this->helpText = $helpText;
    }

    public function getAllAppendixTypes()
    {
        $types = new ArrayCollection();
        foreach ($this->appendixTypes as $otat) {
            $types->add($otat->getAppendixType());
        }
        return $types;
    }
}
