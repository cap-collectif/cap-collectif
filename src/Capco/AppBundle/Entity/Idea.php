<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\ValidableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Idea.
 *
 * @ORM\Table(name="idea")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Idea implements Contribution, CommentableInterface, VotableInterface, HasAuthorInterface
{
    use CommentableTrait;
    use ValidableTrait;
    use VotableOkTrait;
    use TimestampableTrait;
    use ExpirableTrait;
    use IdTrait;
    use TextableTrait;

    public static $sortCriterias = [
        'last' => 'idea.sort.last',
        'old' => 'idea.sort.old',
        'popular' => 'idea.sort.popular',
        'comments' => 'idea.sort.comments',
    ];

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\Length(min=3)
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false)
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="object", type="text", nullable=true)
     * @Assert\NotBlank()
     */
    private $object;

    /**
     * @ORM\Column(name="url", type="string", nullable=true)
     * @Assert\Url()
     */
    private $url;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="change", field={"title", "body", "Theme", "Author", "Media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt = null;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="ideas", cascade={"persist"})
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id", nullable=true)
     * @CapcoAssert\HasThemeIfActivated()
     */
    private $theme = null;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="ideas")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $media;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Idea", cascade={"persist", "remove"})
     */
    private $Reports;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\IdeaComment", mappedBy="Idea",  cascade={"persist", "remove"})
     */
    private $comments;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New idea';
    }

    public function getKind(): string
    {
        return 'idea';
    }

    public function getRelated()
    {
        return null;
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return Idea
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
     * Set slug.
     *
     * @param string $slug
     *
     * @return Idea
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
     * @return string
     */
    public function getObject()
    {
        return $this->object;
    }

    /**
     * @param string $object
     */
    public function setObject($object)
    {
        $this->object = $object;
    }

    /**
     * @return null|string
     */
    public function getUrl()
    {
        return $this->url;
    }

    public function setUrl(string $url = null): self
    {
        $this->url = $url;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * @param Theme $theme
     */
    public function setTheme(Theme $theme)
    {
        $this->theme = $theme;
        $theme->addIdea($this);

        return $this;
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
    public function setAuthor(User $Author)
    {
        $this->Author = $Author;

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
    public function setMedia(Media $media = null)
    {
        $this->media = $media;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return Idea
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isTrashed.
     *
     * @param bool $isTrashed
     *
     * @return Idea
     */
    public function setIsTrashed($isTrashed)
    {
        if (false === $this->isTrashed) {
            $this->trashedReason = null;
            $this->trashedAt = null;
        }
        $this->isTrashed = $isTrashed;

        return $this;
    }

    /**
     * Get isTrashed.
     *
     * @return bool
     */
    public function getIsTrashed()
    {
        return $this->isTrashed;
    }

    /**
     * Set trashedAt.
     *
     * @param \DateTime $trashedAt
     *
     * @return Idea
     */
    public function setTrashedAt($trashedAt)
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    /**
     * Get trashedAt.
     *
     * @return \DateTime
     */
    public function getTrashedAt()
    {
        return $this->trashedAt;
    }

    /**
     * Set trashedReason.
     *
     * @param string $trashedReason
     *
     * @return Idea
     */
    public function setTrashedReason($trashedReason)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    /**
     * Get trashedReason.
     *
     * @return string
     */
    public function getTrashedReason()
    {
        return $this->trashedReason;
    }

    /**
     * @return string
     */
    public function getReports()
    {
        return $this->Reports;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    // **************** Custom methods ***************

    public function getClassName()
    {
        return 'Idea';
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled;
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->isEnabled && !$this->isTrashed;
    }

    // ************* Lifecycle *********************

    /**
     * @ORM\PreRemove
     */
    public function deleteIdea()
    {
        if (null !== $this->theme) {
            $this->theme->removeIdea($this);
        }
    }

    public function isIndexable(): bool
    {
        return $this->getIsEnabled() && !$this->isExpired();
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'idea';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Ideas', 'ThemeDetails'];
    }
}
