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

    const VOTE_WIDGET_TYPE_DISABLED = 0;
    const VOTE_WIDGET_TYPE_ACCORD = 1;
    const VOTE_WIDGET_TYPE_FAVORABLE = 2;

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
    private $voteWidgetType;

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
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled;

    /**
     * @var string
     *
     * @ORM\Column(name="help_text", type="string", length=255, nullable=true)
     */
    private $helpText = null;

    public function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_TYPE_ACCORD;
        $this->Opinions = new ArrayCollection();
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return 'New opinion type';
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
}
