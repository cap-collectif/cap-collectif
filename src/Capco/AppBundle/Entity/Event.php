<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\CommentableWithoutCounterTrait;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\SoftDeleteTrait;
use Capco\AppBundle\Traits\TimeRangeableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use phpDocumentor\Reflection\Types\Boolean;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="event", indexes={
 *     @ORM\Index(name="idx_enabled", columns={"id", "is_enabled"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\EndAfterStart()
 * @CapcoAssert\HasValidAddress()
 * @CapcoAssert\CheckRegister()
 * @CapcoAssert\HasAuthor()
 */
class Event implements CommentableInterface, IndexableInterface, DisplayableInBOInterface, TimeRangeable, Authorable, Translatable, Ownerable, CreatableInterface, \Stringable
{
    use AuthorableTrait;
    use BodyUsingJoditWysiwygTrait;
    use CommentableWithoutCounterTrait;
    use CreatableTrait;
    use CustomCodeTrait;
    use DateHelperTrait;
    use OwnerableTrait;
    use SoftDeleteTrait;
    use TimeRangeableTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?User $author = null;

    /**
     * @Gedmo\Timestampable(on="change", field={"startAt", "endAt", "zipCode", "address", "nbAddress", "media", "Theme"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": false})
     */
    private bool $enabled = false;

    /**
     * @ORM\Column(name="start_at", type="datetime")
     */
    private \DateTimeInterface $startAt;

    /**
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $endAt = null;

    /**
     * @ORM\Column(name="zipCode", type="string", nullable=true)
     */
    private ?string $zipCode = null;

    /**
     * @ORM\Column(name="address_json", type="text", nullable=true)
     */
    private ?string $addressJson = null;

    /**
     * @ORM\Column(name="address", type="string", length=255, nullable=true)
     */
    private ?string $address = null;

    /**
     * @ORM\Column(name="city", type="string", length=255, nullable=true)
     */
    private ?string $city = null;

    /**
     * @ORM\Column(name="country", type="string", nullable=true)
     */
    private ?string $country = null;

    /**
     * @ORM\Column(name="lat", type="float", nullable=true)
     */
    private ?float $lat = null;

    /**
     * @ORM\Column(name="lng", type="float", nullable=true)
     */
    private ?float $lng = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private ?Media $media = null;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="theme_event")
     */
    private Collection $themes;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="project_event")
     */
    private Collection $projects;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="event_step")
     */
    private ?Collection $steps = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventComment", mappedBy="Event",  cascade={"persist", "remove"})
     */
    private Collection $comments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EventRegistration", mappedBy="event",  cascade={"persist", "remove"})
     */
    private Collection $registrations;

    /**
     * @ORM\Column(name="guest_list_enabled", type="boolean", nullable=false)
     */
    private bool $guestListEnabled = false;

    /**
     * @ORM\Column(name="room_name", type="text", nullable=true)
     */
    private ?string $roomName = null;

    /**
     * TODO to remove after recette is ok.
     *
     * @ORM\Column(name="similarity_of_new_address", type="float", nullable=true)
     */
    private ?bool $similarityOfNewAddress = null;

    /**
     * TODO to remove after recette is ok.
     *
     * @ORM\Column(name="new_address_is_similar", type="boolean", nullable=true)
     */
    private ?bool $newAddressIsSimilar = null;

    /**
     * @var EventReview
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\EventReview", fetch="EAGER", cascade={"persist"})
     * @ORM\JoinColumn(name="review_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?EventReview $review = null;

    /**
     * @ORM\Column(name="admin_authorize_data_transfer", type="boolean", nullable=false)
     */
    private bool $adminAuthorizeDataTransfer = false;

    /**
     * @ORM\Column(name="author_agree_to_use_personal_data_for_event_only", type="boolean", nullable=true)
     */
    private ?bool $authorAgreeToUsePersonalDataForEventOnly = null;

    /**
     * @ORM\Column(name="measurable", type="boolean", options={"default": false})
     */
    private bool $measurable = false;

    /**
     * @ORM\Column(name="max_registrations", type="integer", nullable=true)
     * @Assert\Positive
     */
    private ?int $maxRegistrations = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\EventDistrictPositioner", mappedBy="event", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="event_district_positioner_id", referencedColumnName="id", nullable=true)
     */
    private ?Collection $eventDistrictPositioners = null;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->registrations = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->steps = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New event';
    }

    public function setMedia($media)
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function getThemes(): iterable
    {
        $themes = $this->themes->toArray();

        usort($themes, function ($a, $b) {
            return $a->getPosition() <=> $b->getPosition();
        });

        return $themes;
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

    public function getSteps(): Collection
    {
        return $this->steps;
    }

    public function addStep(AbstractStep $step): self
    {
        if (!$this->steps->contains($step)) {
            $this->steps->add($step);
        }
        $step->addEvent($this);

        return $this;
    }

    public function removeStep(AbstractStep $step): self
    {
        $this->steps->removeElement($step);
        $step->removeEvent($this);

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

    public function getLat(?bool $fromJson = true): ?float
    {
        if ($this->addressJson && $fromJson) {
            return json_decode($this->addressJson, true)[0]['geometry']['location']['lat'];
        }

        return $this->lat;
    }

    /**
     * @param float|int|string $lat
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

    public function getLng(?bool $fromJson = true): ?float
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

    /**
     * TODO refacto is Enabled and isEnabledOrApproved in graphql schema, React components, es Serializer, Normalizer etc as 2 different fields.
     */
    public function isEnabled(): bool
    {
        return $this->isEnabledOrApproved();
    }

    public function isEnabledOrApproved(): bool
    {
        if ($this->review) {
            return EventReviewStatusType::APPROVED === $this->review->getStatus();
        }

        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getRegistrations()
    {
        return $this->registrations;
    }

    public function removeRegistration(EventRegistration $registration): self
    {
        $this->registrations->removeElement($registration);

        return $this;
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
        return EventReviewStatusType::APPROVED === $this->getStatus()
            || EventReviewStatusType::PUBLISHED === $this->getStatus();
    }

    public function getStartYear()
    {
        return $this->getYear($this->startAt);
    }

    public function getStartMonth()
    {
        return $this->getMonth($this->startAt);
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
        if (null !== $this->getLink() || $this->guestListEnabled) {
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

    public function getReview(): ?EventReview
    {
        return $this->review;
    }

    public function setReview(?EventReview $review): self
    {
        $this->review = $review;

        return $this;
    }

    public function getAdminAuthorizeDataTransfer(): bool
    {
        return $this->adminAuthorizeDataTransfer;
    }

    public function setAdminAuthorizeDataTransfer($adminAuthorizeDataTransfer): self
    {
        $this->adminAuthorizeDataTransfer = $adminAuthorizeDataTransfer;

        return $this;
    }

    public function getAuthorAgreeToUsePersonalDataForEventOnly(): ?bool
    {
        return $this->authorAgreeToUsePersonalDataForEventOnly;
    }

    public function setAuthorAgreeToUsePersonalDataForEventOnly(
        ?bool $authorAgreeToUsePersonalDataForEventOnly
    ): self {
        $this->authorAgreeToUsePersonalDataForEventOnly = $authorAgreeToUsePersonalDataForEventOnly;

        return $this;
    }

    public function getStatus(): string
    {
        if ($this->getReview()) {
            return $this->getReview()->getStatus();
        }
        if ($this->isDeleted()) {
            return EventReviewStatusType::DELETED;
        }
        if ($this->enabled) {
            return EventReviewStatusType::PUBLISHED;
        }

        return EventReviewStatusType::NOT_PUBLISHED;
    }

    public function softDelete()
    {
        if ($this->comments) {
            foreach ($this->comments as $comment) {
                $this->removeComment($comment);
            }
        }

        if ($this->themes) {
            foreach ($this->themes as $theme) {
                $this->removeTheme($theme);
            }
        }

        if ($this->projects) {
            foreach ($this->projects as $project) {
                $this->removeProject($project);
            }
        }

        $this->setBody('');
        $this->deletedAt = new \DateTime();
        $dontShouldBeNull = [
            'id',
            'comments',
            'themes',
            'projects',
            'registrations',
            'startAt',
            'enabled',
            'deletedAt',
            'slug',
            'body',
            'title',
            'currentLocale',
            'defaultLocale',
            'translations',
            'newTranslations',
            'guestListEnabled',
            'adminAuthorizeDataTransfer',
            'commentable',
            'createdAt',
            'bodyUsingJoditWysiwyg',
            'measurable',
            'maxRegistrations',
        ];

        foreach ($this as $key => $value) {
            if (!\in_array($key, $dontShouldBeNull)) {
                $this->{$key} = null; //set to null instead of unsetting
            }
        }

        $this->maxRegistrations = 0;
        $this->measurable = false;
        $this->enabled = false;
        $this->commentable = false;
    }

    /** ======== Elasticsearch methods ========== */
    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 1;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'event';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchEvent',
            'ElasticsearchEventNestedAuthor',
            'ElasticsearchEventNestedProject',
            'ElasticsearchEventNestedTheme',
        ];
    }

    public static function getTranslationEntityClass(): string
    {
        return EventTranslation::class;
    }

    public function getTitle(
        ?string $locale = null,
        ?bool $fallbackToDefault = true,
        ?bool $fallbackToAny = true
    ): ?string {
        $title = $this->translate($locale, $fallbackToDefault)->getTitle();
        if (!$title && $fallbackToAny) {
            foreach ($this->getTranslations() as $translation) {
                return $translation->getTitle();
            }
        }

        return $title;
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

    public function setSlug(?string $slug = null): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): string
    {
        return (string) $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    public function getLink(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getLink();
    }

    public function setLink(?string $link = null): self
    {
        $this->translate(null, false)->setLink($link);

        return $this;
    }

    public function getMetaDescription(
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ): ?string {
        return $this->translate($locale, $fallbackToDefault)->getMetaDescription();
    }

    public function setMetaDescription(?string $metaDescription = null): self
    {
        $this->translate(null, false)->setMetaDescription($metaDescription);

        return $this;
    }

    public function getRoomName(): ?string
    {
        return $this->roomName;
    }

    public function setRoomName(?string $roomName): self
    {
        $this->roomName = $roomName;

        return $this;
    }

    public function isMeasurable(): bool
    {
        return $this->measurable;
    }

    public function setMeasurable(bool $measurable): self
    {
        $this->measurable = $measurable;

        return $this;
    }

    public function getMaxRegistrations(): ?int
    {
        return $this->maxRegistrations;
    }

    public function setMaxRegistrations(?int $maxRegistrations = null): self
    {
        $this->maxRegistrations = $maxRegistrations;

        return $this;
    }

    public function getAvailableRegistration(): ?int
    {
        return $this->maxRegistrations
            ? $this->maxRegistrations - $this->registrations->count()
            : null;
    }

    public function isRegistrationComplete(): bool
    {
        if (null === $this->maxRegistrations) {
            return false;
        }

        if ($this->measurable) {
            return $this->maxRegistrations === $this->registrations->count();
        }
        if ($this->guestListEnabled) {
            return $this->maxRegistrations === $this->registrations->count();
        }

        return false;
    }

    public function getEventDistrictPositioners(): Collection
    {
        return $this->eventDistrictPositioners;
    }

    public function setEventDistrictPositioners(Collection $eventDistrictPositioners): self
    {
        $this->eventDistrictPositioners = $eventDistrictPositioners;

        return $this;
    }

    public function getDistricts(): array
    {
        if (!$this->eventDistrictPositioners) {
            return [];
        }

        return $this->eventDistrictPositioners->map(function ($eventDistrictPositioner) {
            return $eventDistrictPositioner->getDistrict();
        })->toArray();
    }
}
