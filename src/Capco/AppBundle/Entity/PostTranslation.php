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
 * @ORM\Entity()
 * @ORM\Table(
 *  name="blog_post_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class PostTranslation implements Translation
{
    use UuidTrait;
    use TranslationTrait;
    use SluggableTitleTrait;
    use TextableTrait;
    use MetaDescriptionTrait;

    /**
     * @ORM\Column(name="abstract", type="text", nullable=true)
     */
    private $abstract;

    public static function getTranslatableEntityClass(): string
    {
        return Post::class;
    }

    public function getAbstract(): ?string
    {
        return $this->abstract;
    }

    public function setAbstract(?string $abstract = null): self
    {
        $this->abstract = $abstract;

        return $this;
    }
}
