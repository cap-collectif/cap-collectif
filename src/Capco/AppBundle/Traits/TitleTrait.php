<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
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
        return $this->title ?? '';
    }

    public function setTitle(?string $title = null): self
    {
        $this->title = $title;

        return $this;
    }
}
