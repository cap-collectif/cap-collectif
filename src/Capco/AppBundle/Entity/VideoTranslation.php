<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *  name="video_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class VideoTranslation implements Translation
{
    use SluggableTitleTrait;
    use TextableTrait;
    use TranslationTrait;
    use UuidTrait;

    public static function getTranslatableEntityClass(): string
    {
        return Video::class;
    }
}
