<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Enum\ReviewStatus;
use Capco\AppBundle\Traits\SoftDeleteTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\DateHelperTrait;
use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Traits\CommentableWithoutCounterTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;

/**
 * @ORM\Table(name="event", indexes={
 *     @ORM\Index(name="idx_enabled", columns={"id", "is_enabled"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\EndAfterStart()
 * @CapcoAssert\HasValidAddress()
 * @CapcoAssert\CheckRegister()
 */
class Event implements
    CommentableInterface,
    IndexableInterface,
    DisplayableInBOInterface,
    TimeRangeable,
    Authorable
{
    use SoftDeleteTrait;
    use DateHelperTrait;
    use CommentableWithoutCounterTrait;
    use UuidTrait;
    use TextableTrait;
    use MetaDescriptionCustomCodeTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255, nullable=false, unique=true)
     */
    protected $slug;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body", "startAt", "endAt", "zipCode", "address", "nbAddress", "link", "media", "Theme"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $enabled = false;

    /**
     * @ORM\Column(name="start_at", type="datetime")
     */
    private $startAt;

    /**
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt;

    /**
     * @ORM\Column(name="zipCode", type="string", nullable=true)
     */
    private $zipCode;

    /**
     * @ORM\Column(name="address_json", type="text", nullable=true)
     */
    private $addressJson;

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
    private $media;

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
    private $author;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventComment", mappedBy="Event",  cascade={"persist", "remove"})
     */
    private $comments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventRegistration", mappedBy="event",  cascade={"persist", "remove"})
     */
    private $registrations;

    /**
     * @ORM\Column(name="guest_list_enabled", type="boolean", nullable=false)
     */
    private $guestListEnabled = false;

    /**
     * TODO to remove after recette is ok.
     *
     * @ORM\Column(name="similarity_of_new_address", type="float", nullable=true)
     */
    private $similarityOfNewAddress;

    /**
     * TODO to remove after recette is ok.
     *
     * @ORM\Column(name="new_address_is_similar", type="boolean", nullable=true)
     */
    private $newAddressIsSimilar;

    /**
     * @var Review
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Review", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="review_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $review;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->registrations = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->projects = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New event';
    }

    public function setMedia($media)
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia()
    {
        return $this->media;
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

    public function getProjects(): Collection
    {
        return $this->projects;
    }

    public function addProject(Project $project): self
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
        }
        $project->addEvent($this);

        return $this;
    }

    public function removeProject(Project $project): self
    {
        $this->projects->removeElement($project);
        $project->removeEvent($this);

        return $this;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setZipCode(?string $zipCode): self
    {
        $this->zipCode = $zipCode;

        return $this;
    }

    public function getZipCode(): ?string
    {
        return $this->zipCode;
    }

    public function setAddress(?string $address = null): self
    {
        $this->address = $address;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setCity(?string $city = null): self
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

    public function setCountry(?string $country = null): self
    {
        $this->country = $country;

        return $this;
    }

    public function getLat(?bool $fromJson = false): ?float
    {
        if ($this->addressJson && $fromJson) {
            return json_decode($this->addressJson, true)[0]['geometry']['location']['lat'];
        }

        return $this->lat;
    }

    /**
     * @param string|float|int $lat
     */
    public function setLat($lat): self
    {
        if (\is_string($lat)) {
            $lat = str_replace(',', '.', $lat);
            $lat = (float) $lat;
        }

        $this->lat = $lat;

        return $this;
    }

    public function getLng(?bool $fromJson = false): ?float
    {
        if ($this->addressJson && $fromJson) {
            return json_decode($this->addressJson, true)[0]['geometry']['location']['lng'];
        }

        return $this->lng;
    }

    public function setLng($lng): self
    {
        if (\is_string($lng)) {
            $lng = str_replace(',', '.', $lng);
            $lng = (float) $lng;
        }
        $this->lng = $lng;

        return $this;
    }

    public function setLink(?string $link = null): self
    {
        $this->link = $link;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function isEnabled(): bool
    {
        if ($this->review) {
            return ReviewStatus::APPROVED === $this->review->getStatus();
        }

        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(?\DateTime $startAt = null): self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(?\DateTime $endAt = null): self
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function getRegistrations()
    {
        return $this->registrations;
    }

    public function setGuestListEnabled(bool $guestListEnabled): self
    {
        $this->guestListEnabled = $guestListEnabled;

        return $this;
    }

    public function isGuestListEnabled(): bool
    {
        return $this->guestListEnabled;
    }

    // **************** Custom methods ***************

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay(): bool
    {
        return true;
    }

    public function canContribute($user = null): bool
    {
        return $this->enabled;
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
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 2;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'event';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch', 'ElasticsearchNestedAuthor', 'ElasticsearchNestedProject'];
    }

    public function viewerCanSeeInBo($user = null): bool
    {
        return true;
    }

    public function getFullAddress(?bool $fromJson = false): ?string
    {
        if ($fromJson && $this->addressJson) {
            return json_decode($this->addressJson, true)[0]['formatted_address'];
        }

        $address = !empty($this->getAddress()) ? $this->getAddress() . ', ' : '';
        $address .= !empty($this->getZipCode()) ? $this->getZipCode() . ' ' : '';
        $address .= !empty($this->getCity()) ? $this->getCity() : '';

        $address = rtrim($address, ', ');

        return ltrim(trim($address), ' ,');
    }

    public function getIsRegistrable(): bool
    {
        return $this->isRegistrable();
    }

    public function isRegistrable(): bool
    {
        if (!empty($this->link) || $this->guestListEnabled) {
            return true;
        }

        return false;
    }

    public function getAddressJson(): ?string
    {
        return $this->addressJson;
    }

    public function setAddressJson(?string $addressJson = null): self
    {
        $this->addressJson = $addressJson;

        return $this;
    }

    public function getSimilarityOfNewAddress(): ?float
    {
        return $this->similarityOfNewAddress;
    }

    public function setSimilarityOfNewAddress(?float $similarityOfNewAddress = null): self
    {
        $this->similarityOfNewAddress = $similarityOfNewAddress;

        return $this;
    }

    public function getNewAddressIsSimilar(): ?bool
    {
        return $this->newAddressIsSimilar;
    }

    public function setNewAddressIsSimilar(?bool $newAddressIsSimilar = null): self
    {
        $this->newAddressIsSimilar = $newAddressIsSimilar;

        return $this;
    }

    public function getReview(): ?Review
    {
        return $this->review;
    }

    public function setReview(?Review $review): self
    {
        $this->review = $review;

        return $this;
    }
}
