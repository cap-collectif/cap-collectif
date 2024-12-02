<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="media__gallery_media")
 * @ORM\HasLifecycleCallbacks
 */
class GalleryHasMedia implements \Stringable
{
    use IdTrait;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private int $position;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     */
    private bool $enabled;

    /**
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \Datetime $updatedAt;

    /**
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Gallery", inversedBy="galleryHasMedias")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private Gallery $gallery;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", inversedBy="galleryHasMedias")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private Media $media;

    public function __toString(): string
    {
        return $this->getGallery() . ' | ' . $this->getMedia();
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

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): self
    {
        $this->position = $position;

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

    public function getUpdatedAt(): \Datetime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\Datetime $updatedAt): self
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

    public function getGallery(): Gallery
    {
        return $this->gallery;
    }

    public function setGallery(Gallery $gallery): self
    {
        $this->gallery = $gallery;

        return $this;
    }

    public function getMedia(): Media
    {
        return $this->media;
    }

    public function setMedia(Media $media): self
    {
        $this->media = $media;

        return $this;
    }
}
