<?php

namespace Capco\ClassificationBundle\Entity;

use Capco\AppBundle\Entity\Media;
use Cocur\Slugify\Slugify;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Category implements \Stringable
{
    protected int $id;
    protected ?string $name;
    protected ?string $slug;
    protected bool $enabled;
    protected ?string $description;
    protected ?\DateTimeInterface $createdAt;
    protected ?\DateTimeInterface $updatedAt;
    protected ?int $position;
    protected Collection $children;
    protected ?Category $parent;
    protected ?Media $media;
    protected ?Context $context;

    public function __construct()
    {
        $this->children = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getName() ?: 'n/a';
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        $this->setSlug($name);

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getEnabled(): bool
    {
        return $this->enabled;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = Slugify::create()->slugify($slug);

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function prePersist()
    {
        $this->setCreatedAt(new \DateTime());
        $this->setUpdatedAt(new \DateTime());
    }

    public function preUpdate()
    {
        $this->setUpdatedAt(new \DateTime());
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setPosition(int $position): self
    {
        $this->position = $position;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    /**
     * @deprecated only used by the AdminHelper
     */
    public function addChildren(self $child): self
    {
        $this->addChild($child, true);

        return $this;
    }

    public function addChild(self $child, $nested = false): self
    {
        $this->children[] = $child;

        if ($this->getContext()) {
            $child->setContext($this->getContext());
        }

        if (!$nested) {
            $child->setParent($this, true);
        }

        return $this;
    }

    public function removeChild(self $childToDelete): self
    {
        foreach ($this->getChildren() as $pos => $child) {
            if ($childToDelete->getId() && $child->getId() === $childToDelete->getId()) {
                unset($this->children[$pos]);

                return $this;
            }

            if (!$childToDelete->getId() && $child === $childToDelete) {
                unset($this->children[$pos]);

                return $this;
            }
        }

        return $this;
    }

    public function getChildren(): ?Collection
    {
        return $this->children;
    }

    public function setChildren(iterable $children): self
    {
        $this->children = new ArrayCollection();

        foreach ($children as $category) {
            $this->addChild($category);
        }

        return $this;
    }

    public function hasChildren(): bool
    {
        return \count($this->children) > 0;
    }

    public function setParent(?self $parent = null, $nested = false): self
    {
        $this->parent = $parent;

        if (!$nested && $parent) {
            $parent->addChild($this, true);
        }

        return $this;
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    public function setMedia(?Media $media = null): self
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setContext(Context $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getContext(): ?Context
    {
        return $this->context;
    }
}
