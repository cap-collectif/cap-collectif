<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="blog_post")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Post implements CommentableInterface, IndexableInterface, Ownerable, Translatable, CreatableInterface
{
    use BodyUsingJoditWysiwygTrait;
    use CommentableTrait;
    use CreatableTrait;
    use CustomCodeTrait;
    use OwnerableTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="is_published", type="boolean", options={"default": false})
     */
    private bool $isPublished = false;

    /**
     * @ORM\Column(name="dislayed_on_blog", type="boolean", nullable=false)
     */
    private bool $displayedOnBlog = true;

    /**
     * @ORM\Column(name="published_at", type="datetime", nullable=true)
     */
    private \DateTime $publishedAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body", "abstract"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $media = null;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="theme_post")
     */
    private Collection $themes;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="posts", cascade={"persist"})
     * @ORM\JoinTable(name="project_post")
     */
    private Collection $projects;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", cascade={"persist"})
     * @ORM\JoinTable(name="proposal_post")
     */
    private Collection $proposals;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\PostAuthor", cascade={"persist", "remove"}, mappedBy="post", orphanRemoval=true)
     */
    private Collection $authors;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\PostComment", mappedBy="post")
     */
    private Collection $comments;

    public function __construct()
    {
        $this->authors = new ArrayCollection();
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
        return $this->getId() ? $this->translate()->getTitle() : 'New post';
    }

    public static function getTranslationEntityClass(): string
    {
        return PostTranslation::class;
    }

    public function getTitle(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitle();
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    public function getAbstract(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getAbstract();
    }

    public function setAbstract(?string $abstract = null): self
    {
        $this->translate(null, false)->setAbstract($abstract);

        return $this;
    }

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public function getMetaDescription(
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ): ?string {
        return $this->translate($locale, $fallbackToDefault)->getMetaDescription();
    }

    public function setMetaDescription(?string $metadescription = null): self
    {
        $this->translate(null, false)->setMetaDescription($metadescription);

        return $this;
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        $body = $this->translate($locale, $fallbackToDefault)->getBody();

        return html_entity_decode((string) $body, \ENT_QUOTES, 'UTF-8');
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    public function getBodyText(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBodyText();
    }

    public function getAbstractOrBeginningOfTheText(
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ) {
        if ($this->getAbstract($locale, $fallbackToDefault)) {
            return Text::htmlToString($this->getAbstract($locale, $fallbackToDefault));
        }

        $abstract =
            \strlen((string) $this->getBodyText($locale, $fallbackToDefault)) > 300
                ? substr((string) $this->getBodyText($locale, $fallbackToDefault), 0, 300) . ' [&hellip;]'
                : $this->getBodyText($locale, $fallbackToDefault);

        return Text::htmlToString($abstract);
    }

    public function setIsPublished(bool $isPublished): self
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    public function getIsPublished(): bool
    {
        return $this->isPublished;
    }

    public function setDisplayedOnBlog(bool $displayedOnBlog): self
    {
        $this->displayedOnBlog = $displayedOnBlog;

        return $this;
    }

    public function isDisplayedOnBlog(): bool
    {
        return $this->displayedOnBlog;
    }

    public function setPublishedAt(?\DateTime $publishedAt): self
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function publishNow(): self
    {
        $this->isPublished = true;
        $this->publishedAt = new \DateTime();

        return $this;
    }

    public function getPublishedAt(): ?\DateTime
    {
        return $this->publishedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    public function addAuthor(PostAuthor $postAuthor): self
    {
        if (
            !$this->authors->contains($postAuthor)
            && !$this->containAuthor($postAuthor->getAuthor())
        ) {
            $this->authors->add($postAuthor);
        }

        return $this;
    }

    public function containAuthor(?Author $author): bool
    {
        if (!$author) {
            return false;
        }
        /** @var PostAuthor $postAuthor */
        foreach ($this->authors as $postAuthor) {
            if ($postAuthor->getAuthor() === $author) {
                return true;
            }
        }

        return false;
    }

    public function getPostAuthor(Author $author): ?PostAuthor
    {
        /** @var PostAuthor $postAuthor */
        foreach ($this->authors as $postAuthor) {
            if ($postAuthor->getAuthor() === $author) {
                return $postAuthor;
            }
        }

        return null;
    }

    public function removeAuthor(PostAuthor $author): self
    {
        if ($this->authors->contains($author)) {
            $this->authors->removeElement($author);
        }

        return $this;
    }

    public function setAuthors(?ArrayCollection $authors): self
    {
        $this->authors = $authors ?? new ArrayCollection([]);

        return $this;
    }

    public function getAuthors(): Collection
    {
        return $this->authors;
    }

    public function getAuthorsObject(): Collection
    {
        return $this->authors->map(function (PostAuthor $author) {
            return $author->getAuthor();
        });
    }

    /**
     * Returns true if the post is publicly visible at a given date.
     */
    public function isPublic(?\DateTime $now = null): bool
    {
        if (null === $now) {
            $now = new \DateTime();
        }

        return $this->isPublished && $now > $this->publishedAt;
    }

    public function setMedia(?Media $media = null): self
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function getThemes(): Collection
    {
        return $this->themes;
    }

    public function addTheme(Theme $theme): self
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
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay()
    {
        return true;
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

        if ($this->projects->count() > 0) {
            foreach ($this->projects as $project) {
                $project->removePost($this);
            }
        }
    }

    public function isAuthor(Author $author): bool
    {
        foreach ($this->authors as $postAuthor) {
            if ($postAuthor->getAuthor() === $author) {
                return true;
            }
        }

        return false;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 2;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'post';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch', 'ElasticsearchNestedAuthor'];
    }

    public static function create(User $creator): self
    {
        return (new self())->setCreator($creator);
    }
}
