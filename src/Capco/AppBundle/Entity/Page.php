<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="page")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PageRepository")
 */
class Page implements EntityInterface, TranslatableInterface, \Stringable
{
    use CustomCodeTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="cover_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $cover;

    /**
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
     */
    private $isEnabled = true;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\MenuItem", mappedBy="Page", cascade={"persist", "remove"})
     */
    private $MenuItems;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $media;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->MenuItems = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New page';
    }

    public static function getTranslationEntityClass(): string
    {
        return PageTranslation::class;
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    // Make sure to use nullable typehint in case field is not translated yet.
    public function getTitle(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getTitle();
    }

    // Make sure to use nullable typehint in case field is not translated yet.
    public function getSlug(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    // Make sure to use nullable typehint in case field is not translated yet.
    public function getMetaDescription(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getMetaDescription();
    }

    public function setMetaDescription(?string $metadescription = null): self
    {
        $this->translate(null, false)->setMetaDescription($metadescription);

        return $this;
    }

    public function setBody(string $body): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    // Make sure to use nullable typehint in case field is not translated yet.
    public function getBody(?string $locale = null): ?string
    {
        return $this->translate($locale, false)->getBody();
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setMedia(?Media $media): self
    {
        $this->media = $media;

        return $this;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getMenuItems()
    {
        return $this->MenuItems;
    }

    public function setMenuItems($menuItems)
    {
        $this->MenuItems = $menuItems;
    }

    public function addMenuItem($menuItem)
    {
        if (!$this->MenuItems->contains($menuItem)) {
            $this->MenuItems->add($menuItem);
        }
    }

    public function removeMenuItem($menuItem)
    {
        $this->MenuItems->removeElement($menuItem);
    }

    public function getCover(): ?Media
    {
        return $this->cover;
    }

    public function setCover(?Media $cover): self
    {
        $this->cover = $cover;

        return $this;
    }
}
