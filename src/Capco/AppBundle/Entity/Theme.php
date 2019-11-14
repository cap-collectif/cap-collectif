<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
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
class Theme implements IndexableInterface, Translatable, SonataTranslatableInterface
{
    use UuidTrait;
    use CustomCodeTrait;
    use TimestampableTrait;
    use SonataTranslatableTrait;
    use TranslatableTrait;

    const STATUS_CLOSED = 0;
    const STATUS_OPENED = 1;
    const STATUS_FUTURE = 2;

    const FILTER_ALL = 'all';

    public static $statuses = [
        'closed' => self::STATUS_CLOSED,
        'opened' => self::STATUS_OPENED,
        'future' => self::STATUS_FUTURE
    ];

    public static $statusesLabels = [
        'theme.show.status.closed' => self::STATUS_CLOSED,
        'theme.show.status.opened' => self::STATUS_OPENED,
        'theme.show.status.future' => self::STATUS_FUTURE
    ];

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
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
    private $Author;

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
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
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

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New theme';
    }

    public function getTitle(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getTitle();
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    public function getSlug(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public function getTeaser(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getTeaser();
    }

    public function setTeaser(?string $teaser): self
    {
        $this->translate(null, false)->setTeaser($teaser);

        return $this;
    }

    public function getMetaDescription(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getMetaDescription();
    }

    public function setMetaDescription(?string $metadescription = null): self
    {
        $this->translate(null, false)->setMetaDescription($metadescription);

        return $this;
    }

    public function getBody(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getBody();
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

    /**
     * @param mixed $position
     */
    public function setPosition($position)
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
     * @param Project $project
     *
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
     * @param Project $project
     *
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
     * @param Proposal $proposal
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
     *
     * @param Proposal $proposal
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
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
     * @param Post $post
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
     * @param Post $post
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

    /**
     * @param mixed $media
     */
    public function setMedia($media)
    {
        $this->media = $media;
    }

    // ********************** custom methods ****************************

    public function getBodyExcerpt($nb = 100)
    {
        $excerpt = substr($this->body, 0, $nb);

        return $excerpt . '...';
    }

    public function getTeaserExcerpt($nb = 100)
    {
        $excerpt = substr($this->teaser, 0, $nb);

        return $excerpt . '...';
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
        $count = 0;
        /** @var Project $project */
        foreach ($this->projects as $project) {
            if ($project->isPublic()) {
                ++$count;
            }
        }

        return $count;
    }

    public function countEnabledPosts(): int
    {
        return $this->posts
            ->map(function (Post $post) {
                return $post->canDisplay() && $post->getIsPublished();
            })
            ->count();
    }

    public function countEnabledEvents(): int
    {
        return $this->events
            ->map(function (Event $event) {
                return $event->isEnabled();
            })
            ->count();
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
        return 8;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'theme';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch', 'ElasticsearchNestedAuthor'];
    }

    public static function getTranslationEntityClass(): string
    {
        return ThemeTranslation::class;
    }
}
