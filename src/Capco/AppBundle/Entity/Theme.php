<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="theme")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ThemeRepository")
 */
class Theme implements IndexableInterface, TranslatableInterface, \Stringable
{
    use CustomCodeTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    final public const STATUS_CLOSED = 0;
    final public const STATUS_OPENED = 1;
    final public const STATUS_FUTURE = 2;

    final public const FILTER_ALL = 'all';

    public static $statuses = [
        'closed' => self::STATUS_CLOSED,
        'opened' => self::STATUS_OPENED,
        'future' => self::STATUS_FUTURE,
    ];

    public static $statusesLabels = [
        'theme.show.status.closed' => self::STATUS_CLOSED,
        'theme.show.status.opened' => self::STATUS_OPENED,
        'theme.show.status.future' => self::STATUS_FUTURE,
    ];

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
     */
    private $isEnabled = true;

    /**
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private $position;

    /**
     * @ORM\Column(name="status", type="integer", nullable=true)
     */
    private $status;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    private $author;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "teaser", "position", "status", "body", "media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", mappedBy="themes", cascade={"persist"})
     */
    private $projects;

    /**
     * @ORM\OneToMany(
     *   targetEntity="Capco\AppBundle\Entity\Proposal",
     *   mappedBy="theme",
     *   cascade={"persist"}
     * )
     */
    private $proposals;

    /**
     * @var ArrayCollection
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Event", mappedBy="themes", cascade={"persist"})
     */
    private $events;

    /**
     * @var ArrayCollection
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Post", mappedBy="themes", cascade={"persist"})
     */
    private $posts;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $media;

    public function __construct()
    {
        $this->projects = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->posts = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString(): string
    {
        return (string) ($this->getId() ? $this->translate()->getTitle() : 'New theme');
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

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public function getTeaser(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTeaser();
    }

    public function setTeaser(?string $teaser): self
    {
        $this->translate(null, false)->setTeaser($teaser);

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
        return $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
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
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    public function setPosition(mixed $position)
    {
        $this->position = $position;
    }

    /**
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param int $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getAuthor()
    {
        return $this->author;
    }

    public function setAuthor(mixed $author)
    {
        $this->author = $author;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getProjects()
    {
        return $this->projects;
    }

    /**
     * @return Theme
     */
    public function addProject(Project $project)
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function removeProject(Project $project)
    {
        $this->projects->removeElement($project);

        return $this;
    }

    /**
     * Get proposals.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * Add proposal.
     *
     * @return Theme
     */
    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    /**
     * Remove proposal.
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }

    public function setEvents(array $events): self
    {
        $this->events = new ArrayCollection($events);

        return $this;
    }

    public function setPosts(array $posts): self
    {
        $this->posts = new ArrayCollection($posts);

        return $this;
    }

    public function setProjects(array $projects): self
    {
        $this->projects = new ArrayCollection($projects);

        return $this;
    }

    public function getEvents()
    {
        return $this->events;
    }

    public function addEvent(Event $event): self
    {
        if (!$this->events->contains($event)) {
            $this->events->add($event);
        }

        return $this;
    }

    public function removeEvent(Event $event): self
    {
        $this->events->removeElement($event);

        return $this;
    }

    /**
     * Get Posts.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPosts()
    {
        return $this->posts;
    }

    /**
     * Add Post.
     *
     * @return $this
     */
    public function addPost(Post $post)
    {
        if (!$this->posts->contains($post)) {
            $this->posts[] = $post;
        }

        return $this;
    }

    /**
     * Remove post.
     *
     * @return $this
     */
    public function removePost(Post $post)
    {
        $this->posts->removeElement($post);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getMedia()
    {
        return $this->media;
    }

    public function setMedia(mixed $media)
    {
        $this->media = $media;
    }

    // ********************** custom methods ****************************

    public function getBodyExcerpt($nb = 100)
    {
        return $this->translate()->getBodyExcerpt();
    }

    public function getTeaserExcerpt($nb = 100)
    {
        return $this->translate()->getTeaserExcerpt();
    }

    public function canContribute()
    {
        return $this->isEnabled;
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay()
    {
        return $this->isEnabled;
    }

    public function countEnabledProjects()
    {
        // TODO manage access projects with visibility
        return $this->countPublicProject();
    }

    public function countPublicProject()
    {
        return $this->projects
            ->filter(fn (Project $project) => $project->isPublic())
            ->count()
        ;
    }

    public function countEnabledPosts(): int
    {
        return $this->posts
            ->filter(fn (Post $post) => $post->canDisplay() && $post->getIsPublished())
            ->count()
        ;
    }

    public function countEnabledEvents(): int
    {
        return $this->events
            ->filter(fn (Event $event) => $event->isEnabled())
            ->count()
        ;
    }

    public function isOpened()
    {
        return $this->status === self::$statuses['opened'];
    }

    public function isClosed()
    {
        return $this->status === self::$statuses['closed'];
    }

    public function isFuture()
    {
        return $this->status === self::$statuses['future'];
    }

    public function isIndexable(): bool
    {
        return $this->getIsEnabled();
    }

    public static function getElasticsearchPriority(): int
    {
        return 3;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'theme';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchTheme', 'ElasticsearchThemeNestedAuthor'];
    }

    public static function getTranslationEntityClass(): string
    {
        return ThemeTranslation::class;
    }
}
