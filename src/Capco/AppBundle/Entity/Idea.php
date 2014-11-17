<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Idea
 *
 * @ORM\Table(name="idea")
 * @ORM\Entity
 */
class Idea
{
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
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     */
    private $body;

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
     * @var integer
     *
     * @ORM\Column(name="vote_count", type="integer")
     */
    private $voteCount;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="ideas")
     */
    private $Theme;

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
     * @return Ideas
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
     * @return Ideas
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
     * @return Ideas
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
     * @return Ideas
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


}
