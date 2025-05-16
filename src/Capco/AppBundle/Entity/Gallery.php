<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="media__gallery")
 * @ORM\HasLifecycleCallbacks
 */
class Gallery implements EntityInterface
{
    use IdTrait;

    /**
     * @ORM\Column(name="name", type="string", length=255)
     */
    private string $name;

    /**
     * @ORM\Column(name="context", type="string", length=64)
     */
    private string $context;

    /**
     * @ORM\Column(name="default_format", type="string", length=255)
     */
    private string $defaultFormat = 'reference';

    /**
     * @ORM\Column(name="enabled", type="boolean")
     */
    private bool $enabled;

    /**
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    /**
     * @var Collection<int, GalleryHasMedia>
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\GalleryHasMedia", mappedBy="gallery")
     */
    private Collection $galleryHasMedias;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getContext(): string
    {
        return $this->context;
    }

    public function setContext(string $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getDefaultFormat(): string
    {
        return $this->defaultFormat;
    }

    public function setDefaultFormat(string $defaultFormat): self
    {
        $this->defaultFormat = $defaultFormat;

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

    /**
     * @return Collection<int, GalleryHasMedia>
     */
    public function getGalleryHasMedias(): Collection
    {
        return $this->galleryHasMedias;
    }

    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia): self
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    /**
     * @param iterable<GalleryHasMedia> $galleryHasMedias
     */
    public function setGalleryHasMedias(iterable $galleryHasMedias): self
    {
        $this->galleryHasMedias = new ArrayCollection();

        foreach ($galleryHasMedias as $galleryHasMedia) {
            $this->addGalleryHasMedia($galleryHasMedia);
        }

        return $this;
    }

    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia): self
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);

        return $this;
    }

    public function reorderGalleryHasMedia(): void
    {
        $galleryHasMedias = $this->getGalleryHasMedias();

        $iterator = $galleryHasMedias->getIterator();

        $iterator->uasort(
            static fn (GalleryHasMedia $a, GalleryHasMedia $b): int => $a->getPosition() <=> $b->getPosition()
        );

        $this->setGalleryHasMedias($iterator);
    }
}
