<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Organization\OrganizationTranslationRepository")
 * @ORM\Table(
 *  name="organization_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class OrganizationTranslation implements Translation
{
    use SluggableTitleTrait;
    use TextableTrait;
    use TranslationTrait;
    use UuidTrait;

    public static function getTranslatableEntityClass(): string
    {
        return Organization::class;
    }
}
