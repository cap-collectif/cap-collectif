<?php

namespace Capco\MediaBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\ClassificationBundle\Entity\Category;
use Capco\MediaBundle\Provider\AllowedExtensions;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Imagine\Image\Box;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class Media
{
    /*
     * @TODO most of these fields are not used but are inherited from sonata.
     * A cleaning should be done with a migration when we are sure everything is ok.
     */
    use UuidTrait;
    protected ?string $name = null;
    protected string $description;
    protected bool $enabled = false;
    protected string $providerName;
    protected int $providerStatus = 1;
    protected ?string $providerReference = null;
    protected array $providerMetadata = [];
    protected int $width;
    protected int $height;
    protected float $length;
    protected string $copyright;
    protected string $authorName;
    protected string $context;
    protected ?bool $cdnIsFlushable = false;
    protected string $cdnFlushIdentifier;
    protected \DateTime $cdnFlushAt;
    protected int $cdnStatus;
    protected \DateTime $updatedAt;
    protected \DateTime $createdAt;
    protected $binaryContent;
    protected ?string $previousProviderReference = null;
    protected ?string $contentType = null;
    protected int $size;
    protected Collection $galleryHasMedias;
    protected ?Category $category = null;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getName() ?: 'n/a';
    }

    public function prePersist()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function preUpdate()
    {
        $this->updatedAt = new \DateTime();
    }

    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);
    }

    public function isImage(): bool
    {
        return \in_array($this->contentType, AllowedExtensions::ALLOWED_MIMETYPES_IMAGE);
    }

    /**
     * @TODO REMOVE
     */
    public static function getStatusList()
    {
        return [
            1 => 'ok',
            2 => 'sending',
            3 => 'pending',
            4 => 'error',
            5 => 'encoding',
        ];
    }

    public function setBinaryContent($binaryContent)
    {
        $this->binaryContent = $binaryContent;
    }

    public function resetBinaryContent()
    {
        $this->binaryContent = null;
    }

    public function getBinaryContent()
    {
        return $this->binaryContent;
    }

    public function getMetadataValue($name, $default = null)
    {
        $metadata = $this->getProviderMetadata();

        return $metadata[$name] ?? $default;
    }

    public function setMetadataValue($name, $value)
    {
        $metadata = $this->getProviderMetadata();
        $metadata[$name] = $value;
        $this->setProviderMetadata($metadata);
    }

    public function unsetMetadataValue($name)
    {
        $metadata = $this->getProviderMetadata();
        unset($metadata[$name]);
        $this->setProviderMetadata($metadata);
    }

    public function setName($name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
    }

    public function getEnabled()
    {
        return $this->enabled;
    }

    public function setProviderName($providerName)
    {
        $this->providerName = $providerName;
    }

    public function getProviderName()
    {
        return $this->providerName;
    }

    public function setProviderStatus($providerStatus)
    {
        $this->providerStatus = $providerStatus;
    }

    public function getProviderStatus()
    {
        return $this->providerStatus;
    }

    public function setProviderReference($providerReference)
    {
        $this->providerReference = $providerReference;
    }

    public function getProviderReference()
    {
        return $this->providerReference;
    }

    public function setProviderMetadata(array $providerMetadata = [])
    {
        $this->providerMetadata = $providerMetadata;
    }

    public function getProviderMetadata()
    {
        return $this->providerMetadata;
    }

    public function setWidth($width)
    {
        $this->width = $width;
    }

    public function getWidth()
    {
        return $this->width;
    }

    public function setHeight($height)
    {
        $this->height = $height;
    }

    public function getHeight()
    {
        return $this->height;
    }

    public function setLength($length)
    {
        $this->length = $length;
    }

    public function getLength()
    {
        return $this->length;
    }

    public function setCopyright($copyright)
    {
        $this->copyright = $copyright;
    }

    public function getCopyright()
    {
        return $this->copyright;
    }

    public function setAuthorName($authorName)
    {
        $this->authorName = $authorName;
    }

    public function getAuthorName()
    {
        return $this->authorName;
    }

    public function setContext($context)
    {
        $this->context = $context;
    }

    public function getContext()
    {
        return $this->context;
    }

    public function setCdnIsFlushable($cdnIsFlushable)
    {
        $this->cdnIsFlushable = $cdnIsFlushable;
    }

    public function getCdnIsFlushable()
    {
        return $this->cdnIsFlushable;
    }

    public function setCdnFlushIdentifier($cdnFlushIdentifier)
    {
        $this->cdnFlushIdentifier = $cdnFlushIdentifier;
    }

    public function getCdnFlushIdentifier()
    {
        return $this->cdnFlushIdentifier;
    }

    public function setCdnFlushAt(?\DateTime $cdnFlushAt = null)
    {
        $this->cdnFlushAt = $cdnFlushAt;
    }

    public function getCdnFlushAt()
    {
        return $this->cdnFlushAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt = null)
    {
        $this->updatedAt = $updatedAt;
    }

    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    public function setCreatedAt(?\DateTime $createdAt = null)
    {
        $this->createdAt = $createdAt;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function setContentType($contentType)
    {
        $this->contentType = $contentType;
    }

    public function getContentType()
    {
        return $this->contentType;
    }

    /**
     * @TODO REMOVE
     */
    public function getExtension()
    {
        $providerReference = $this->getProviderReference();
        if (!$providerReference) {
            return null;
        }

        // strips off query strings or hashes, which are common in URIs remote references
        return preg_replace('{(\?|#).*}', '', pathinfo($providerReference, \PATHINFO_EXTENSION));
    }

    public function setSize($size)
    {
        $this->size = $size;
    }

    public function getSize()
    {
        return $this->size;
    }

    public function setCdnStatus($cdnStatus)
    {
        $this->cdnStatus = $cdnStatus;
    }

    public function getCdnStatus()
    {
        return $this->cdnStatus;
    }

    /**
     * @TODO REMOVE
     */
    public function getBox()
    {
        return new Box($this->width, $this->height);
    }

    public function setGalleryHasMedias($galleryHasMedias)
    {
        $this->galleryHasMedias = $galleryHasMedias;
    }

    public function getGalleryHasMedias()
    {
        return $this->galleryHasMedias;
    }

    public function getPreviousProviderReference()
    {
        return $this->previousProviderReference;
    }

    /**
     * @TODO REMOVE
     *
     * @param mixed $context
     */
    public function isStatusErroneous($context): void
    {
        if ($this->getBinaryContent() && 4 === $this->getProviderStatus()) {
            // NEXT_MAJOR: Restore type hint
            if (!$context instanceof ExecutionContextInterface) {
                throw new \InvalidArgumentException('Argument 1 should be an instance of Symfony\Component\Validator\ExecutionContextInterface');
            }

            $context
                ->buildViolation('invalid')
                ->atPath('binaryContent')
                ->addViolation()
            ;
        }
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category = null): self
    {
        $this->category = $category;

        return $this;
    }
}
