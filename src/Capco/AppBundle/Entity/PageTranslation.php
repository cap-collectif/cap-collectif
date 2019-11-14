<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Page;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\TitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\MetaDescriptionTrait;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *  name="page_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class PageTranslation implements Translation
{
    use UuidTrait;
    use TranslationTrait;
    use SluggableTitleTrait;
    use TextableTrait;
    use MetaDescriptionTrait;

    public static function getTranslatableEntityClass(): string
    {
        return Page::class;
    }
}
