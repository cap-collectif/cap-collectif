<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Utils\Text;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="blog_post")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Post implements CommentableInterface, IndexableInterface
{
    use CommentableTrait, IdTrait, TextableTrait, MetaDescriptionCustomCodeTrait;

    /**
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
     * @Gedmo\Slug(separator="-", unique=true, fields={"title"}, updatable=false)
     * @ORM\Column(name="slug", unique=true, type="string", length=255)
     */
    private $slug;

    /**
     * @ORM\Column(name="is_published", type="boolean")
     */
    private $isPublished = false;

    /**
     * @ORM\Column(name="dislayed_on_blog", type="boolean", nullable=false)
     */
    private $displayedOnBlog = true;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
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
    private $media;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="theme_post")
     */
    private $themes;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="project_post")
     */
    private $projects;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", cascade={"persist"})
     * @ORM\JoinTable(name="proposal_post")
     */
    private $proposals;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\UserBundle\Entity\User", cascade={"persist"})
     * @ORM\JoinTable(name="blog_post_authors",
     *      joinColumns={@ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE")}
     *      )
     */
    private $Authors;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\PostComment", mappedBy="post")
     */
    private $comments;

    public function __construct()
    {
        $this->Authors = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->commentsCount = 0;
        $this->updatedAt = new \DateTime();
        $this->publishedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New post';
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
     * Set isPublished.
     *
     * @param bool $isPublished
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
     * @return bool
     */
    public function getIsPublished()
    {
        return $this->isPublished;
    }

    public function setdisplayedOnBlog(bool $displayedOnBlog): self
    {
        $this->displayedOnBlog = $displayedOnBlog;

        return $this;
    }

    public function isdisplayedOnBlog(): bool
    {
        return $this->displayedOnBlog;
    }

    /**
     * Set createdAt.@.
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
     * @return bool
     */
    public function isPublic($now = null)
    {
        if (null === $now) {
            $now = new \DateTime();
        }

        return $this->isPublished && $now > $this->publishedAt;
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
        $this->media = $media;

        return $this;
    }

    /**
     * Get media.
     *
     * @return \Capco\MediaBundle\Entity\Media
     */
    public function getMedia()
    {
        return $this->media;
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
     * Get projects.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getProjects()
    {
        return $this->projects;
    }

    /**
     * Add project.
     *
     * @param \Capco\AppBundle\Entity\Project $project
     *
     * @return $this
     */
    public function addProject(Project $project)
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
        }
        $project->addPost($this);

        return $this;
    }

    /**
     * Remove project.
     *
     * @param \Capco\AppBundle\Entity\Project $project
     *
     * @return $this
     */
    public function removeProject(Project $project)
    {
        $this->projects->removeElement($project);
        $project->removePost($this);

        return $this;
    }

    public function getProposals(): Collection
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal): self
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals->add($proposal);
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal): self
    {
        if ($this->proposals->contains($proposal)) {
            $this->proposals->removeElement($proposal);
        }

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

    public function getAbstractOrBeginningOfTheText()
    {
        if ($this->abstract) {
            return Text::htmlToString($this->abstract);
        }

        $abstract =
            \strlen($this->getBodyText()) > 300
                ? substr($this->getBodyText(), 0, 300) . ' [&hellip;]'
                : $this->getBodyText();

        return Text::htmlToString($abstract);
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

        if ($this->projects->count() > 0) {
            foreach ($this->projects as $project) {
                $project->removePost($this);
            }
        }
    }

    public function isIndexable(): bool
    {
        return $this->getIsPublished();
    }

    public static function getElasticsearchPriority(): int
    {
        return 5;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'post';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
