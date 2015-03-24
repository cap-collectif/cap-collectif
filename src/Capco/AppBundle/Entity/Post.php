<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Post.
 *
 * @ORM\Table(name="blog_post")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Post implements CommentableInterface
{
    use CommentableTrait;

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
     * @Assert\NotBlank()
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="abstract", type="text", nullable=true)
     */
    private $abstract;

    /**
     * @var string
     * @Gedmo\Slug(separator="-", unique=true, fields={"title"})
     * @ORM\Column(name="slug", type="string", length=255)
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
     * @ORM\Column(name="is_published", type="boolean")
     */
    private $isPublished = false;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="published_at", type="datetime", nullable=true)
     */
    private $publishedAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body", "abstract"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $Media;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="theme_post")
     */
    private $themes;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="consultation_post")
     */
    private $consultations;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\UserBundle\Entity\User", cascade={"persist"})
     * @ORM\JoinTable(name="blog_post_authors",
     *      joinColumns={@ORM\JoinColumn(name="post_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE")}
     *      )
     */
    private $Authors;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\PostComment", mappedBy="Post",  cascade={"persist", "remove"})
     */
    private $comments;

    public function __construct()
    {
        $this->Authors = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->consultations = new ArrayCollection();
        $this->voteCount = 0;
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New post";
        }
    }

    /**
     * Get id.
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return Post
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
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
     * Set abstract.
     *
     * @param string $abstract
     *
     * @return Post
     */
    public function setAbstract($abstract)
    {
        $this->abstract = $abstract;

        return $this;
    }

    /**
     * Get abstract.
     *
     * @return string
     */
    public function getAbstract()
    {
        return $this->abstract;
    }

    /**
     * Set slug.
     *
     * @param string $slug
     *
     * @return Post
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

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
     * Set body.
     *
     * @param string $body
     *
     * @return Post
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * Get body.
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * Set isPublished.
     *
     * @param boolean $isPublished
     *
     * @return Post
     */
    public function setIsPublished($isPublished)
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    /**
     * Get isPublished.
     *
     * @return boolean
     */
    public function getIsPublished()
    {
        return $this->isPublished;
    }

    /**
     * Set createdAt.
     *
     * @param \DateTime $createdAt
     *
     * @return Post
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

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
     * Set publishedAt.
     *
     * @param \DateTime $publishedAt
     *
     * @return Post
     */
    public function setPublishedAt($publishedAt)
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    /**
     * Get publishedAt.
     *
     * @return \DateTime
     */
    public function getPublishedAt()
    {
        return $this->publishedAt;
    }

    /**
     * Set updatedAt.
     *
     * @param \DateTime $updatedAt
     *
     * @return Post
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
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
     * Add author.
     *
     * @param \Capco\UserBundle\Entity\User $author
     *
     * @return Post
     */
    public function addAuthor(\Capco\UserBundle\Entity\User $author)
    {
        if (!$this->Authors->contains($author)) {
            $this->Authors[] = $author;
        }

        return $this;
    }

    /**
     * Remove author.
     *
     * @param \Capco\UserBundle\Entity\User $author
     */
    public function removeAuthor(\Capco\UserBundle\Entity\User $author)
    {
        $this->Authors->removeElement($author);
    }

    /**
     * Get authors.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getAuthors()
    {
        return $this->Authors;
    }

    /**
     * Returns true if the post is publicly visible at a given date.
     *
     * @param \DateTime $now
     *
     * @return boolean
     */
    public function isPublic($now = null)
    {
        if (null === $now) {
            $now = new \DateTime();
        }

        return $this->isPublished && ($now > $this->publishedAt);
    }

    /**
     * Set media.
     *
     * @param \Capco\MediaBundle\Entity\Media $media
     *
     * @return Post
     */
    public function setMedia(\Capco\MediaBundle\Entity\Media $media = null)
    {
        $this->Media = $media;

        return $this;
    }

    /**
     * Get media.
     *
     * @return \Capco\MediaBundle\Entity\Media
     */
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * Get themes.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getThemes()
    {
        return $this->themes;
    }

    /**
     * Add theme.
     *
     * @param \Capco\AppBundle\Entity\Theme $theme
     *
     * @return $this
     */
    public function addTheme(Theme $theme)
    {
        if (!$this->themes->contains($theme)) {
            $this->themes->add($theme);
        }
        $theme->addPost($this);

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
        $this->themes->removeElement($theme);
        $theme->removePost($this);

        return $this;
    }

    /**
     * Get consultations.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getConsultations()
    {
        return $this->consultations;
    }

    /**
     * Add consultation.
     *
     * @param \Capco\AppBundle\Entity\Consultation $consultation
     *
     * @return $this
     */
    public function addConsultation(Consultation $consultation)
    {
        if (!$this->consultations->contains($consultation)) {
            $this->consultations->add($consultation);
        }
        $consultation->addPost($this);

        return $this;
    }

    /**
     * Remove consultation.
     *
     * @param \Capco\AppBundle\Entity\Consultation $consultation
     *
     * @return $this
     */
    public function removeConsultation(Consultation $consultation)
    {
        $this->consultations->removeElement($consultation);
        $consultation->removePost($this);

        return $this;
    }

    // **************************** Commentable Methods **************************
    public function getClassName()
    {
        return 'Post';
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isPublished;
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->isPublished;
    }

    // ************************** Lifecycle **************************************

    /**
     * @ORM\PreRemove
     */
    public function deletePost()
    {
        if ($this->themes->count() > 0) {
            foreach ($this->themes as $theme) {
                $theme->removePost($this);
            }
        }

        if ($this->consultations->count() > 0) {
            foreach ($this->consultations as $consultation) {
                $consultation->removePost($this);
            }
        }
    }
}
