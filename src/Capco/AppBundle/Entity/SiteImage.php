<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * SiteImage.
 *
 * @ORM\Table(name="site_image")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SiteImageRepository")
 */
class SiteImage
{
    use IdTrait;

    /**
     * @ORM\Column(name="keyname", type="string", length=255)
     */
    private $keyname;

    /**
     * @ORM\Column(name="is_social_network_thumbnail", type="boolean", nullable=false)
     */
    private $isSocialNetworkThumbnail = false;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="Media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $media;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position = 0;

    /**
     * @ORM\Column(name="category", type="text")
     */
    private $category = 'settings.global';

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getKeyname() : 'New image';
    }

    public function setKeyname(string $keyname): self
    {
        $this->keyname = $keyname;

        return $this;
    }

    public function getKeyname(): string
    {
        return $this->keyname;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setMedia(?Media $media): void
    {
        $this->media = $media;
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

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): void
    {
        $this->position = $position;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): void
    {
        $this->category = $category;
    }

    public function isSocialNetworkThumbnail(): bool
    {
        return $this->isSocialNetworkThumbnail;
    }

    public function setIsSocialNetworkThumbnail(bool $isSocialNetworkThumbnail)
    {
        $this->isSocialNetworkThumbnail = $isSocialNetworkThumbnail;

        return $this;
    }
}
