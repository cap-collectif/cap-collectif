<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\MetaDescriptionTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ThemeTranslationRepository")
 * @ORM\Table(
 *  name="theme_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class ThemeTranslation implements Translation
{
    use UuidTrait;
    use TranslationTrait;
    use SluggableTitleTrait;
    use TextableTrait;
    use MetaDescriptionTrait;

    /**
     * @ORM\Column(name="teaser", type="string", length=255, nullable=true)
     */
    private $teaser;


    public static function getTranslatableEntityClass(): string
    {
        return Theme::class;
    }

    public function getTeaser(): ?string
    {
        return $this->teaser;
    }

    public function setTeaser(?string $teaser): self
    {
        $this->teaser = $teaser;

        return $this;
    }
}
