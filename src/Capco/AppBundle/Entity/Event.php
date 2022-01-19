<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\SoftDeleteTrait;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Traits\TimeRangeableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Traits\DateHelperTrait;
use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Model\CommentableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Traits\CommentableWithoutCounterTrait;
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
    Authorable,
    Translatable,
    SonataTranslatableInterface
{
    use CommentableWithoutCounterTrait;
    use CustomCodeTrait;
    use DateHelperTrait;
    use SoftDeleteTrait;
    use SonataTranslatableTrait;
    use TimeRangeableTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;
    use BodyUsingJoditWysiwygTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"startAt", "endAt", "zipCode", "address", "nbAddress", "media", "Theme"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": false})
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
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep", inversedBy="events", cascade={"persist"})
     * @ORM\JoinTable(name="event_step")
     */
    private $steps;
    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     * @Assert\NotNull()
     */
    private $author;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="animator_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $animator;

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
     * @ORM\Column(name="room_name", type="text", nullable=true)
     */
    private $roomName;

    /**
     * @ORM\Column(name="jitsi_token", type="text", nullable=true)
     */
    private $jitsiToken;

    /**
     * @ORM\Column(name="is_presential", type="boolean", nullable=false, options={"default": true})
     */
    private $isPresential = true;

    /**
     * @ORM\Column(name="recording_link", type="text", nullable=true)
     */
    private $recordingLink;

    /**
     * @ORM\Column(name="is_recording_published", type="boolean", nullable=false, options={"default": false})
     */
    private $isRecordingPublished = false;

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
     * @var EventReview
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\EventReview", fetch="EAGER", cascade={"persist"})
     * @ORM\JoinColumn(name="review_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $review;

    /**
     * @ORM\Column(name="admin_authorize_data_transfer", type="boolean", nullable=false)
     */
    private $adminAuthorizeDataTransfer = false;

    /**
     * @ORM\Column(name="author_agree_to_use_personal_data_for_event_only", type="boolean", nullable=true)
     */
    private $authorAgreeToUsePersonalDataForEventOnly;

    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     */
    private ?User $owner;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->registrations = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->steps = new ArrayCollection();
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

    public function getRecordingLink(): ?string
    {
        return $this->recordingLink;
    }

    public function setRecordingLink(?string $recordingLink): self
    {
        $this->recordingLink = $recordingLink;

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
        return EventReviewStatusType::APPROVED === $this->getStatus() ||
            EventReviewStatusType::PUBLISHED === $this->getStatus();
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

    public function getNewAddressIsSimilar(): ?bool
    {
        return $this->newAddressIsSimilar;
    }

    public function setNewAddressIsSimilar(?bool $newAddressIsSimilar = null): self
    {
        $this->newAddressIsSimilar = $newAddressIsSimilar;

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
            'isPresential',
            'isRecordingPublished',
            'adminAuthorizeDataTransfer',
            'commentable',
            'createdAt',
            'bodyUsingJoditWysiwyg',
        ];

        foreach ($this as $key => $value) {
            if (!\in_array($key, $dontShouldBeNull)) {
                $this->{$key} = null; //set to null instead of unsetting
            }
        }

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

    public function getJitsiToken(): ?string
    {
        return $this->jitsiToken;
    }

    public function setJitsiToken(?string $jitsiToken): self
    {
        $this->jitsiToken = $jitsiToken;

        return $this;
    }

    public function getIsPresential(): bool
    {
        return $this->isPresential;
    }

    public function setIsPresential(bool $isPresential): self
    {
        $this->isPresential = $isPresential;

        return $this;
    }

    public function getIsRecordingPublished(): bool
    {
        return $this->isRecordingPublished;
    }

    public function setIsRecordingPublished(bool $isRecordingPublished): self
    {
        $this->isRecordingPublished = $isRecordingPublished;

        return $this;
    }

    public function getAnimator(): ?User
    {
        return $this->animator;
    }

    public function setAnimator(?User $animator): self
    {
        $this->animator = $animator;

        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    /**
     * @return Event
     */
    public function setOwner(?User $owner): self
    {
        $this->owner = $owner;

        return $this;
    }
}
