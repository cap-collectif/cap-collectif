<?php

namespace Capco\AppBundle\Entity\District;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Entity\Styles\BorderStyle;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Entity\Styles\BackgroundStyle;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Model\SonataTranslatableInterface;

/**
 * @ORM\Table(name="district")
 * @ORM\Entity
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "district_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "proposal"        = "ProposalDistrict",
 *      "project"         = "ProjectDistrict",
 * })
 */
abstract class AbstractDistrict implements
    IndexableInterface,
    Translatable,
    SonataTranslatableInterface
{
    use SonataTranslatableTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="geojson", type="json", nullable=true)
     */
    private $geojson;

    /**
     * @ORM\Column(name="geojson_style", type="string", nullable=true)
     */
    private $geojsonStyle;

    /**
     * @ORM\Column(name="display_on_map", nullable=false, type="boolean", options={"default": true})
     */
    private $displayedOnMap = true;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Styles\BorderStyle", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="border_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $border;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Styles\BackgroundStyle", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="background_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $background;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function getGeojson(): ?string
    {
        return $this->geojson;
    }

    public function setGeojson(?string $geojson = null): self
    {
        $this->geojson = $geojson;

        return $this;
    }

    public function getGeojsonStyle(): ?string
    {
        return $this->geojsonStyle;
    }

    public function setGeojsonStyle(?string $geojsonStyle = null): self
    {
        $this->geojsonStyle = $geojsonStyle;

        return $this;
    }

    public function setDisplayedOnMap(bool $displayedOnMap): self
    {
        $this->displayedOnMap = $displayedOnMap;

        return $this;
    }

    public function isDisplayedOnMap(): bool
    {
        return $this->displayedOnMap;
    }

    public function getName(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getName();
    }

    public function getTitleOnMap(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitleOnMap();
    }

    public function setName(?string $name = null): self
    {
        $this->translate(null, false)->setName($name);

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return DistrictTranslation::class;
    }

    public function getBorder(): ?BorderStyle
    {
        return $this->border;
    }

    public function setBorder(?BorderStyle $border): self
    {
        $this->border = $border;

        return $this;
    }

    public function getBackground(): ?BackgroundStyle
    {
        return $this->background;
    }

    public function setBackground(?BackgroundStyle $background): self
    {
        $this->background = $background;

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 6;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'district';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
