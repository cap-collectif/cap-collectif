<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ProblemType
 *
 * @ORM\Table(name="problem_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProblemTypeRepository")
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
     * @Gedmo\Slug(fields={"problemTitle"})
     * @ORM\Column(length=255)
     */
    private $slug;

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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Problem", mappedBy="ProblemType")
     *
     */
    private $Problems;

    function __construct()
    {
        $this->voteWidgetType = self::VOTE_WIDGET_TYPE_ACCORD;
        $this->Problems = new ArrayCollection();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New problem type";
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


    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return ProblemType
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
     * @return ProblemType
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Add problem
     *
     * @param \Capco\AppBundle\Entity\Problem $problem
     *
     * @return ProblemType
     */
    public function addProblem(\Capco\AppBundle\Entity\Problem $problem)
    {
        $this->Problems[] = $problem;

        return $this;
    }

    /**
     * Remove problem
     *
     * @param \Capco\AppBundle\Entity\Problem $problem
     */
    public function removeProblem(\Capco\AppBundle\Entity\Problem $problem)
    {
        $this->Problems->removeElement($problem);
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }
}
