<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="event")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\EndAfterStart()
 */
class Event implements CommentableInterface, IndexableInterface
{
    use DateHelperTrait, CommentableTrait, UuidTrait, TextableTrait, MetaDescriptionCustomCodeTrait;

    /**
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(separator="-", unique=true, fields={"title"}, updatable=false)
     * @ORM\Column(name="slug", type="string", length=255)
     */
    private $slug;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body", "startAt", "endAt", "zipCode", "address", "nbAddress", "link", "Media", "Theme"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @ORM\Column(name="start_at", type="datetime")
     */
    private $startAt;

    /**
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt = null;

    /**
     * @ORM\Column(name="zipCode", type="integer", nullable=true)
     */
    private $zipCode;

    /**
     * @ORM\Column(name="address", type="string", length=255, nullable=true)
     */
    private $address;

    /**
     * @ORM\Column(name="city", type="string", length=255, nullable=true)
     */
    private $city;

    /**
     * @ORM\Column(name="country", type="string", nullable=true)
     */
    private $country;

    /**
     * @ORM\Column(name="lat", type="float", nullable=true)
     */
    private $lat;

    /**
     * @ORM\Column(name="lng", type="float", nullable=true)
     */
    private $lng;

    /**
     * @ORM\Column(name="link", type="string", length=255, nullable=true)
     * @Assert\Url()
     */
    private $link;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $Media;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="theme_event")
     */
    private $themes;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="project_event")
     */
    private $projects;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     * @Assert\NotNull()
     */
    private $Author;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventComment", mappedBy="Event",  cascade={"persist", "remove"})
     */
    private $comments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventRegistration", mappedBy="event",  cascade={"persist", "remove"})
     */
    private $registrations;

    /**
     * @ORM\Column(name="registration_enable", type="boolean", nullable=false)
     */
    private $registrationEnable = false;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->registrations = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New event';
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setMedia($media)
    {
        $this->Media = $media;

        return $this;
    }

    public function getMedia()
    {
        return $this->Media;
    }

    public function getThemes(): iterable
    {
        return $this->themes;
    }

    public function addTheme(Theme $theme): self
    {
        if (!$this->themes->contains($theme)) {
            $this->themes->add($theme);
        }
        $theme->addEvent($this);

        return $this;
    }

    public function removeTheme(Theme $theme): self
    {
        $this->themes->removeElement($theme);
        $theme->removeEvent($this);

        return $this;
    }

    public function getProjects(): iterable
    {
        return $this->projects;
    }

    public function addProject(Project $project): iterable
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
        }
        $project->addEvent($this);

        return $this;
    }

    public function removeProject(Project $project): iterable
    {
        $this->projects->removeElement($project);
        $project->removeEvent($this);

        return $this;
    }

    public function setAuthor(User $author): self
    {
        $this->Author = $author;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->Author;
    }

    public function setZipCode(int $zipCode): self
    {
        $this->zipCode = $zipCode;

        return $this;
    }

    public function getZipCode(): ?int
    {
        return $this->zipCode;
    }

    public function setAddress(string $address = null): self
    {
        $this->address = $address;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setCity(string $city = null): self
    {
        $this->city = $city;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country = null)
    {
        $this->country = $country;
    }

    /**
     * @return mixed
     */
    public function getLat()
    {
        return $this->lat;
    }

    /**
     * @param mixed $lat
     */
    public function setLat($lat)
    {
        if (is_string($lat)) {
            $lat = (float) $lat;
        }
        $this->lat = $lat;
    }

    /**
     * @return float
     */
    public function getLng()
    {
        return $this->lng;
    }

    /**
     * @param float $lng
     */
    public function setLng($lng)
    {
        if (is_string($lng)) {
            $lng = (float) $lng;
        }
        $this->lng = $lng;
    }

    /**
     * Set link.
     *
     * @param string $link
     *
     * @return Event
     */
    public function setLink($link)
    {
        $this->link = $link;

        return $this;
    }

    /**
     * Get link.
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled)
    {
        $this->isEnabled = $isEnabled;
    }

    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTime $startAt = null)
    {
        $this->startAt = $startAt;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTime $endAt = null)
    {
        $this->endAt = $endAt;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug)
    {
        $this->slug = $slug;
    }

    public function getRegistrations()
    {
        return $this->registrations;
    }

    public function setRegistrationEnable(bool $registrationEnable): self
    {
        $this->registrationEnable = $registrationEnable;

        return $this;
    }

    public function isRegistrationEnable(): bool
    {
        return $this->registrationEnable;
    }

    // **************** Custom methods ***************

    public function getClassName()
    {
        return 'Event';
    }

    public function canDisplay(): bool
    {
        return $this->isEnabled;
    }

    public function canContribute(): bool
    {
        return $this->isEnabled;
    }

    public function lastOneDay()
    {
        if (null === $this->endAt) {
            return true;
        }

        return $this->isSameDate($this->startAt, $this->endAt);
    }

    public function getStartYear()
    {
        return $this->getYear($this->startAt);
    }

    public function getStartMonth()
    {
        return $this->getMonth($this->startAt);
    }

    public function isOpen(): bool
    {
        $now = new \DateTime();

        if (null === $this->endAt) {
            return $this->startAt < $now && $this->isSameDate($this->startAt, $now);
        }

        return $this->startAt < $now && $this->endAt > $now;
    }

    public function isClosed(): bool
    {
        $now = new \DateTime();

        if (null === $this->endAt) {
            return $this->extractDate($this->startAt) < $this->extractDate($now);
        }

        return $this->endAt < $now;
    }

    public function isFuture(): bool
    {
        return $this->startAt > new \DateTime();
    }

    // ************************** Lifecycle **************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteEvent()
    {
        if ($this->themes->count() > 0) {
            foreach ($this->themes as $theme) {
                $theme->removeEvent($this);
            }
        }

        if ($this->projects->count() > 0) {
            foreach ($this->projects as $project) {
                $project->removeEvent($this);
            }
        }
    }

    public function isIndexable(): bool
    {
        return $this->getIsEnabled();
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'event';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
