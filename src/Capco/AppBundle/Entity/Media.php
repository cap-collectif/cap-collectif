<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Provider\AllowedExtensions;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\ClassificationBundle\Entity\Category;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MediaRepository")
 * @ORM\Table(name="media__media")
 * @ORM\HasLifecycleCallbacks
 */
class Media
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", name="name", length=255, nullable=false)
     */
    private string $name = '';

    /**
     * @ORM\Column(type="text", name="description", nullable=true, length=1024)
     */
    private ?string $description = null;

    /**
     * @ORM\Column(type="boolean", name="enabled", nullable=false)
     */
    private bool $enabled = false;

    /**
     * @ORM\Column(type="string", name="provider_name", length=255, nullable=false)
     */
    private string $providerName = '';

    /**
     * @ORM\Column(type="integer", name="provider_status", nullable=false)
     */
    private int $providerStatus = 1;

    /**
     * @ORM\Column(type="string", name="provider_reference", length=255, nullable=false)
     */
    private string $providerReference = '';

    /**
     * @var null|array<mixed>
     * @ORM\Column(type="json", name="provider_metadata", nullable=true)
     */
    private ?array $providerMetadata = [];

    /**
     * @ORM\Column(type="integer", name="width", nullable=true)
     */
    private ?int $width = null;

    /**
     * @ORM\Column(type="integer", name="height", nullable=true)
     */
    private ?int $height = null;

    /**
     * @ORM\Column(type="decimal", name="length", nullable=true)
     */
    private ?int $length = null;

    /**
     * @ORM\Column(type="string", name="content_type", length=255, nullable=true)
     */
    private ?string $contentType = null;

    /**
     * @ORM\Column(type="integer", name="content_size", nullable=true)
     */
    private ?int $size = null;

    /**
     * @ORM\Column(type="string", name="copyright", nullable=true)
     */
    private ?string $copyright = null;

    /**
     * @ORM\Column(type="string", name="author_name", nullable=true)
     */
    private ?string $authorName = null;

    /**
     * @ORM\Column(type="string", name="context", length=64, nullable=true)
     */
    private ?string $context = null;

    /**
     * @ORM\Column(type="boolean", name="cdn_is_flushable", nullable=true)
     */
    private ?bool $cdnIsFlushable = null;

    /**
     * @ORM\Column(type="string", name="cdn_flush_identifier", length=64, nullable=true)
     */
    private ?string $cdnFlushIdentifier = null;

    /**
     * @ORM\Column(type="datetime", name="cdn_flush_at", nullable=true)
     */
    private ?\DateTime $cdnFlushAt = null;

    /**
     * @ORM\Column(type="integer", name="cdn_status", nullable=true)
     */
    private ?int $cdnStatus = null;

    /**
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\Column(type="datetime", name="created_at")
     */
    private \DateTime $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\ClassificationBundle\Entity\Category")
     * @ORM\JoinColumn(onDelete="SET NULL")
     */
    private ?Category $category = null;

    /**
     * @var Collection<int, GalleryHasMedia>
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\GalleryHasMedia", mappedBy="media")
     */
    private Collection $galleryHasMedias;

    private ?File $binaryContent = null;

    private ?string $binaryContentPath = null;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getName() ?: 'n/a';
    }

    public function getBinaryContent(): ?File
    {
        return $this->binaryContent;
    }

    public function setBinaryContent(?File $binaryContent): self
    {
        $this->binaryContent = $binaryContent;

        return $this;
    }

    public function getBinaryContentPath(): ?string
    {
        return $this->binaryContentPath;
    }

    public function setBinaryContentPath(?string $binaryContentPath): self
    {
        $this->binaryContentPath = $binaryContentPath;

        return $this;
    }

    public function resetBinaryContent(): void
    {
        $this->binaryContent = null;
    }

    /**
     * @ORM\PrePersist
     */
    public function prePersist(): void
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia): self
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia): void
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);
    }

    public function isImage(): bool
    {
        return \in_array($this->contentType, AllowedExtensions::ALLOWED_MIMETYPES_IMAGE);
    }

    /**
     * @return array<int, string>
     */
    public static function getStatusList(): array
    {
        return [
            1 => 'ok',
            2 => 'sending',
            3 => 'pending',
            4 => 'error',
            5 => 'encoding',
        ];
    }

    public function getMetadataValue(string $name, ?string $default = null): ?string
    {
        $metadata = $this->getProviderMetadata();

        return $metadata[$name] ?? $default;
    }

    public function setMetadataValue(string $name, string $value): self
    {
        $metadata = $this->getProviderMetadata();
        $metadata[$name] = $value;
        $this->setProviderMetadata($metadata);

        return $this;
    }

    public function unsetMetadataValue(string $name): void
    {
        $metadata = $this->getProviderMetadata();
        unset($metadata[$name]);
        $this->setProviderMetadata($metadata);
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getProviderName(): string
    {
        return $this->providerName;
    }

    public function setProviderName(string $providerName): self
    {
        $this->providerName = $providerName;

        return $this;
    }

    public function getProviderStatus(): int
    {
        return $this->providerStatus;
    }

    public function setProviderStatus(int $providerStatus): self
    {
        $this->providerStatus = $providerStatus;

        return $this;
    }

    public function getProviderReference(): string
    {
        return $this->providerReference;
    }

    public function setProviderReference(string $providerReference): self
    {
        $this->providerReference = $providerReference;

        return $this;
    }

    /**
     * @return null|mixed[]
     */
    public function getProviderMetadata(): ?array
    {
        return $this->providerMetadata;
    }

    /**
     * @param array<mixed> $providerMetadata
     *
     * @return $this
     */
    public function setProviderMetadata(array $providerMetadata = []): self
    {
        $this->providerMetadata = $providerMetadata;

        return $this;
    }

    public function getWidth(): ?int
    {
        return $this->width;
    }

    public function setWidth(?int $width): self
    {
        $this->width = $width;

        return $this;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function setHeight(?int $height): self
    {
        $this->height = $height;

        return $this;
    }

    public function getLength(): ?int
    {
        return $this->length;
    }

    public function setLength(?int $length): self
    {
        $this->length = $length;

        return $this;
    }

    public function getContentType(): ?string
    {
        return $this->contentType;
    }

    public function setContentType(?string $contentType): self
    {
        $this->contentType = $contentType;

        return $this;
    }

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(?int $size): self
    {
        $this->size = $size;

        return $this;
    }

    public function getCopyright(): ?string
    {
        return $this->copyright;
    }

    public function setCopyright(?string $copyright): self
    {
        $this->copyright = $copyright;

        return $this;
    }

    public function getAuthorName(): ?string
    {
        return $this->authorName;
    }

    public function setAuthorName(?string $authorName): self
    {
        $this->authorName = $authorName;

        return $this;
    }

    public function getContext(): ?string
    {
        return $this->context;
    }

    public function setContext(?string $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getCdnIsFlushable(): ?bool
    {
        return $this->cdnIsFlushable;
    }

    public function setCdnIsFlushable(?bool $cdnIsFlushable): self
    {
        $this->cdnIsFlushable = $cdnIsFlushable;

        return $this;
    }

    public function getCdnFlushIdentifier(): ?string
    {
        return $this->cdnFlushIdentifier;
    }

    public function setCdnFlushIdentifier(?string $cdnFlushIdentifier): self
    {
        $this->cdnFlushIdentifier = $cdnFlushIdentifier;

        return $this;
    }

    public function getCdnFlushAt(): ?\DateTime
    {
        return $this->cdnFlushAt;
    }

    public function setCdnFlushAt(?\DateTime $cdnFlushAt): self
    {
        $this->cdnFlushAt = $cdnFlushAt;

        return $this;
    }

    public function getCdnStatus(): ?int
    {
        return $this->cdnStatus;
    }

    public function setCdnStatus(?int $cdnStatus): self
    {
        $this->cdnStatus = $cdnStatus;

        return $this;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): self
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return Collection<int, GalleryHasMedia>
     */
    public function getGalleryHasMedias(): Collection
    {
        return $this->galleryHasMedias;
    }

    /**
     * @param Collection<int, GalleryHasMedia> $galleryHasMedias
     *
     * @return $this
     */
    public function setGalleryHasMedias(Collection $galleryHasMedias): self
    {
        $this->galleryHasMedias = $galleryHasMedias;

        return $this;
    }
}
