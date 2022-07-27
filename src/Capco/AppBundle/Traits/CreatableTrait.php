<?php

namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait CreatableTrait
{
    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     */
    protected ?User $creator = null;

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }
}
