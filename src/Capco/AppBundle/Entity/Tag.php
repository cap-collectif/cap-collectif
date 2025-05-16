<?php

namespace Capco\AppBundle\Entity;

use Capco\Capco\Facade\EntityInterface;
use Cocur\Slugify\Slugify;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Doctrine\ORM\EntityRepository")
 * @ORM\Table(
 *     name="classification__tag",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="tag_context", columns={"slug", "context"})
 *     }
 * )
 * @ORM\HasLifecycleCallbacks
 */
class Tag implements EntityInterface, \Stringable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    protected int $id;

    /**
     * @ORM\Column(type="string")
     */
    protected ?string $name = null;

    /**
     * @ORM\Column(type="string")
     */
    protected ?string $slug = null;

    /**
     * @ORM\Column(type="datetime", name="created_at")
     */
    protected ?\DateTimeInterface $createdAt = null;

    /**
     * @ORM\Column(type="datetime", name="updated_at")
     */
    protected ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\Column(type="boolean")
     */
    protected bool $enabled;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Context")
     * @ORM\JoinColumn(name="context", referencedColumnName="id", nullable=true)
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

    public function setCreatedAt(?\DateTimeInterface $createdAt = null): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    /**
     * @ORM\PrePersist
     */
    public function prePersist(): void
    {
        $this->setCreatedAt(new \DateTimeImmutable());
        $this->setUpdatedAt(new \DateTimeImmutable());
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt = null): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdate(): void
    {
        $this->setUpdatedAt(new \DateTimeImmutable());
    }

    public function setContext(?Context $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getContext(): ?Context
    {
        return $this->context;
    }
}
