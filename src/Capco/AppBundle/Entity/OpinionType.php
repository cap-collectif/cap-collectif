<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * OpinionType
 *
 * @ORM\Table(name="opinion_type")
 * @ORM\Entity
 */
class OpinionType
{
    const VOTE_WIDGET_TYPE_DISABLED = 0;
    const VOTE_WIDGET_TYPE_ACCORD = 1;
    const VOTE_WIDGET_TYPE_FAVORABLE = 2;

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
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="short_name", type="string", length=255)
     */
    private $shortName;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var integer
     *
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    /**
     * @var integer
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
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProblemType", inversedBy="OpinionTypes")
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id")
     */
    private $ProblemType;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="OpinionTypes")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false)
     */
    private $Opinion;

    function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_TYPE_ACCORD;
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New opinion type";
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
     * @return OpinionType
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
     * Set shortName
     *
     * @param string $shortName
     * @return OpinionType
     */
    public function setShortName($shortName)
    {
        $this->shortName = $shortName;

        return $this;
    }

    /**
     * Get shortName
     *
     * @return string
     */
    public function getShortName()
    {
        return $this->shortName;
    }

    /**
     * Set slug
     *
     * @param string $slug
     * @return OpinionType
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
     * Set position
     *
     * @param integer $position
     * @return OpinionType
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get position
     *
     * @return integer
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Set voteWidgetType
     *
     * @param integer $voteWidgetType
     * @return OpinionType
     */
    public function setVoteWidgetType($voteWidgetType)
    {
        $this->voteWidgetType = $voteWidgetType;

        return $this;
    }

    /**
     * Get voteWidgetType
     *
     * @return integer
     */
    public function getVoteWidgetType()
    {
        return $this->voteWidgetType;
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
     * @return mixed
     */
    public function getProblemType()
    {
        return $this->ProblemType;
    }

    /**
     * @param mixed $ProblemType
     */
    public function setProblemType($ProblemType)
    {
        $this->ProblemType = $ProblemType;
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
    }

}
