<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Utils\Text;

/**
 * We use full FQCN imports here because annotations are not correctly transmitted with trait nesting,
 * see for example:
 * https://github.com/doctrine/annotations/issues/268.
 */
trait TitleTrait
{
    /**
     * @Doctrine\ORM\Mapping\Column(name="title", type="string", length=255, nullable=false)
     * @Symfony\Component\Validator\Constraints\NotBlank()
     * @Symfony\Component\Validator\Constraints\Length(max=255)
     */
    protected $title;

    public function getTitle(): ?string
    {
        return Text::htmlToString($this->title ?? '');
    }

    public function setTitle(?string $title = null): self
    {
        $this->title = $title;

        return $this;
    }
}
