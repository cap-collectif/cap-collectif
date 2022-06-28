<?php

namespace Capco\AppBundle\Entity\Interfaces;

/** is the entity Authorable ? */
interface Authorable
{
    public function getAuthor(): ?Author;

    public function setAuthor(?Author $user);
}
