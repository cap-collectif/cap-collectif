<?php

namespace Capco\AppBundle\Entity;

use Cocur\Slugify\Slugify;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Doctrine\ORM\EntityRepository")
 * @ORM\Table(
 *     name="classification__collection",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="tag_collection", columns={"slug", "context"})
 *     }
 * )
 * @ORM\HasLifecycleCallbacks
 */
class Collection implements \Stringable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    protected int $id;

    /**
     * @ORM\Column(type="string", name="name")
     */
    protected ?string $name = null;

    /**
     * @ORM\Column(type="string", name="slug")
     */
    protected ?string $slug = null;

    /**
     * @ORM\Column(type="boolean", name="enabled")
     */
    protected bool $enabled;

    /**
     * @ORM\Column(type="string", name="description", nullable=true)
     */
    protected ?string $description = null;

    /**
     * @ORM\Column(type="datetime", name="created_at")
     */
    protected ?\DateTimeInterface $createdAt = null;

    /**
     * @ORM\Column(type="datetime", name="updated_at")
     */
    protected ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media")
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", onDelete="SET NULL")
     */
    protected ?Media $media = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Context")
     * @ORM\JoinColumn(name="context", referencedColumnName="id")
     */
    protected ?Context $context = null;

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

    /**
     * @ORM\PrePersist
     */
    public function prePersist(): void
    {
        $this->setCreatedAt(new \DateTime());
        $this->setUpdatedAt(new \DateTime());
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdate(): void
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
