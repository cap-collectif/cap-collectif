<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\TranslationTrait;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *  name="site_parameter_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class SiteParameterTranslation implements Translation
{
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="value", type="text")
     */
    private $value;

    public function setValue($value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }

    public static function getTranslatableEntityClass(): string
    {
        return SiteParameter::class;
    }
}
