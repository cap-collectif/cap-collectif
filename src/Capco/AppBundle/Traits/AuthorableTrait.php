<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\UserBundle\Entity\User;

trait AuthorableTrait
{
    public function getAuthor(): ?Author
    {
        return $this->author;
    }

    public function setAuthor(?Author $author): self
    {
        if ($author instanceof User) {
            $this->author = $author;
        }

        return $this;
    }
}
