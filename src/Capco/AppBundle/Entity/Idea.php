<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\ValidableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;

/**
 * Idea.
 *
 * @ORM\Table(name="idea")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Idea implements CommentableInterface, VotableInterface, HasAuthorInterface
{
    use CommentableTrait;
    use ValidableTrait;
    use VotableOkTrait;

    public static $sortCriterias = [
        'last' => 'idea.sort.last',
        'old' => 'idea.sort.old',
        'popular' => 'idea.sort.popular',
        'comments' => 'idea.sort.comments',
    ];

    /**
     * @var int
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
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var string
     *
     * @ORM\Column(name="object", type="text", nullable=true)
     * @Assert\NotBlank()
     */
    private $object;

    /**
     * @var url
     *
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
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

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
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $Media;

    /**
     * @var string
     *
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
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New idea';
    }

    /**
     * Get id.
     *
     * @return int
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
     * Set body.
     *
     * @param string $body
     *
     * @return Idea
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
     * @return url
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * @param url $url
     */
    public function setUrl($url)
    {
        $this->url = $url;
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
     * Get updatedAt.
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
        if (false == $this->isTrashed) {
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

    /**
     * @param int $nb
     *
     * @return string
     */
    public function getExcerpt($nb = 100)
    {
        $excerpt = substr($this->body, 0, $nb);
        $excerpt = $excerpt.'...';

        return $excerpt;
    }

    // ************* Lifecycle *********************

    /**
     * @ORM\PreRemove
     */
    public function deleteIdea()
    {
        if ($this->theme != null) {
            $this->theme->removeIdea($this);
        }
    }
}
