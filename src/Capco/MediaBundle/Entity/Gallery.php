<?php

namespace Capco\MediaBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Gallery
{
    private int $id;
    private string $context;
    private string $name;
    private bool $enabled = true;
    private ?\DateTime $updatedAt = null;
    private ?\DateTime $createdAt = null;
    private string $defaultFormat = 'reference';
    private Collection $galleryHasMedias;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getName() ?: '-';
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

    public function getId(): int
    {
        return $this->id;
    }

    public function setName($name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setEnabled($enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getEnabled(): bool
    {
        return $this->enabled;
    }

    public function setUpdatedAt(?\DateTime $updatedAt = null): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setCreatedAt(?\DateTime $createdAt = null): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\Datetime
    {
        return $this->createdAt;
    }

    public function setDefaultFormat(string $defaultFormat): self
    {
        $this->defaultFormat = $defaultFormat;

        return $this;
    }

    public function getDefaultFormat(): string
    {
        return $this->defaultFormat;
    }

    public function setGalleryHasMedias(iterable $galleryHasMedias): self
    {
        $this->galleryHasMedias = new ArrayCollection();

        foreach ($galleryHasMedias as $galleryHasMedia) {
            $this->addGalleryHasMedia($galleryHasMedia);
        }

        return $this;
    }

    public function getGalleryHasMedias(): Collection
    {
        return $this->galleryHasMedias;
    }

    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia): self
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia): self
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);

        return $this;
    }

    public function setContext(string $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getContext(): string
    {
        return $this->context;
    }

    public function reorderGalleryHasMedia()
    {
        $galleryHasMedias = $this->getGalleryHasMedias();

        $iterator = $galleryHasMedias->getIterator();

        $iterator->uasort(static function (GalleryHasMedia $a, GalleryHasMedia $b): int {
            return $a->getPosition() <=> $b->getPosition();
        });

        $this->setGalleryHasMedias($iterator);
    }
}
