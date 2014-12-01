<?php

namespace Capco\AppBundle\Entity;

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
     * @Gedmo\Timestampable(on="update")
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
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id")
     */
    private $Theme;

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
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"}, fetch="LAZY")
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id")
     */
    private $Media;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\IdeaVote", mappedBy="Idea", cascade={"persist"})
     */
    private $IdeaVotes;

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New idea";
        }

        $this->IdeaVotes = new ArrayCollection();
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
        $this->IdeaVotes = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Add ideaVote
     *
     * @param \Capco\AppBundle\Entity\IdeaVote $ideaVote
     *
     * @return Idea
     */
    public function addIdeaVote(\Capco\AppBundle\Entity\IdeaVote $ideaVote)
    {
        $this->IdeaVotes[] = $ideaVote;

        return $this;
    }

    /**
     * Remove ideaVote
     *
     * @param \Capco\AppBundle\Entity\IdeaVote $ideaVote
     */
    public function removeIdeaVote(\Capco\AppBundle\Entity\IdeaVote $ideaVote)
    {
        $this->IdeaVotes->removeElement($ideaVote);
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
}
