<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ProblemType
 *
 * @ORM\Table(name="problem_type")
 * @ORM\Entity
 */
class ProblemType
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
     * @ORM\Column(name="problemTitle", type="string", length=255)
     */
    private $problemTitle;

    /**
     * @var string
     *
     * @ORM\Column(name="trashTitle", type="string", length=255)
     */
    private $trashTitle = 'Corbeille';

    /**
     * @var integer
     *
     * @ORM\Column(name="voteWidgetType", type="integer")
     */
    private $voteWidgetType;

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
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="ProblemType", cascade={"persist", "remove"})
     *
     */
    private $OpinionTypes;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Problem", mappedBy="ProblemType")
     *
     */
    private $Problems;

    function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_TYPE_ACCORD;
        $this->OpinionTypes = new ArrayCollection();
        $this->Problems = new ArrayCollection();
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
     * @return ProblemType
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
     * Set problemTitle
     *
     * @param string $problemTitle
     * @return ProblemType
     */
    public function setProblemTitle($problemTitle)
    {
        $this->problemTitle = $problemTitle;

        return $this;
    }

    /**
     * Get problemTitle
     *
     * @return string
     */
    public function getProblemTitle()
    {
        return $this->problemTitle;
    }

    /**
     * Set trashTitle
     *
     * @param string $trashTitle
     * @return ProblemType
     */
    public function setTrashTitle($trashTitle)
    {
        $this->trashTitle = $trashTitle;

        return $this;
    }

    /**
     * Get trashTitle
     *
     * @return string
     */
    public function getTrashTitle()
    {
        return $this->trashTitle;
    }

    /**
     * Set voteWidgetType
     *
     * @param integer $voteWidgetType
     * @return ProblemType
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
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getOpinionTypes()
    {
        return $this->OpinionTypes;
    }

    /**
     * @param Capco\AppBundle\Entity\OpinionType $opinionType
     * @return ProblemType
     */
    public function addOpinionType(OpinionType $opinionType)
    {
        $this->OpinionTypes[] = $opinionType;

        return $this;
    }

    /**
     * @param Capco\AppBundle\Entity\OpinionType $opinionType
     *
     */
    public function removeOpinionType(OpinionType $opinionType)
    {
        $this->OpinionTypes->removeElement($opinionType);
    }

    /**
     * @return mixed
     */
    public function getProblems()
    {
        return $this->Problems;
    }

    /**
     * @param Problem $Problems
     */
    public function setProblems(Problem $Problems)
    {
        $this->Problems = $Problems;
    }

}
