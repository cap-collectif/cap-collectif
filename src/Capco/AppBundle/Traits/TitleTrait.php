<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Utils\Text;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait TitleTrait
{
    /**
     * @ORM\Column(name="title", type="string", length=255, nullable=false)
     * @Assert\NotBlank()
     * @Assert\Length(max=255)
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
