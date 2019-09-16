<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\UserBundle\Entity\User;

/** is the entity Authorable ? */
interface Authorable
{
    public function getAuthor(): ?User;

    public function setAuthor(User $user);
}
