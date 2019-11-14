<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait CustomCodeTrait
{
    /**
     * @ORM\Column(name="custom_code", type="text", nullable=true)
     */
    private $customCode;

    public function getCustomCode(): ?string
    {
        return $this->customCode;
    }

    public function setCustomCode(string $customCode = null): self
    {
        $this->customCode = $customCode;

        return $this;
    }
}
