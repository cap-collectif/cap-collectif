<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Traits\FollowableTrait;
use Capco\AppBundle\Traits\Media\CoverTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\GlobalDistrictRepository")
 */
class GlobalDistrict extends AbstractDistrict implements SluggableInterface, \Stringable
{
    use CoverTrait;
    use FollowableTrait;
    use TextableTrait;
    use TranslatableTrait;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Follower", mappedBy="globalDistrict", cascade={"persist"}, orphanRemoval=true)
     */
    private $followers;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrictPositioner", mappedBy="district", cascade={"persist", "remove"})
     */
    private $projectDistrictPositioners;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\EventDistrictPositioner", mappedBy="district", cascade={"persist", "remove"})
     */
    private $eventDistrictPositioners;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $media;

    public function __construct()
    {
        $this->followers = new ArrayCollection();
        $this->projectDistrictPositioners = new ArrayCollection();
        $this->eventDistrictPositioners = new ArrayCollection();
        parent::__construct();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getProjectDistrictPositioners(): iterable
    {
        return $this->projectDistrictPositioners;
    }

    public function setProjectDistrictPositioners(iterable $projectDistrictPositioners): self
    {
        $this->projectDistrictPositioners = $projectDistrictPositioners;

        return $this;
    }

    public function getEventDistrictPositioners(): iterable
    {
        return $this->eventDistrictPositioners;
    }

    public function setEventDistrictPositioners(iterable $eventDistrictPositioners): self
    {
        $this->eventDistrictPositioners = $eventDistrictPositioners;

        return $this;
    }

    public function getDescription(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getDescription();
    }

    public function setDescription(?string $description = null): self
    {
        $this->translate(null, false)->setDescription($description);

        return $this;
    }

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return DistrictTranslation::class;
    }
}
