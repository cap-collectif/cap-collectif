<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="source_category")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SourceCategoryRepository")
 */
class SourceCategory implements EntityInterface, TranslatableInterface, \Stringable
{
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="isEnabled", type="boolean", options={"default": true})
     */
    private $isEnabled = true;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Source", mappedBy="category",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $sources;

    public function __construct()
    {
        $this->sources = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New category';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public static function getTranslationEntityClass(): string
    {
        return SourceCategoryTranslation::class;
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

    public function getIsEnabled(): bool
    {
        return (bool) $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function getSources()
    {
        return $this->sources;
    }

    public function addSource(Source $source): self
    {
        if (!$this->sources->contains($source)) {
            $this->sources->add($source);
        }

        return $this;
    }

    public function removeSource(Source $source): self
    {
        $this->sources->removeElement($source);

        return $this;
    }
}
