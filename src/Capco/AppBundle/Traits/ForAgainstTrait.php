<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ForAgainstTrait
{
    /**
     * @ORM\Column(name="type", type="integer")
     * @Assert\Choice(choices={0, 1})
     */
    private $type = 1;

    public function getType(): int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;

        return $this;
    }
}
