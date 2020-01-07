<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *  name="source_category_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class SourceCategoryTranslation implements Translation
{
    use UuidTrait;
    use TranslationTrait;
    use SluggableTitleTrait;

    public static function getTranslatableEntityClass(): string
    {
        return SourceCategory::class;
    }
}
