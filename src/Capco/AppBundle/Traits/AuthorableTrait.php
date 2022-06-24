<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\Author;

trait AuthorableTrait
{
    public function getAuthor(): ?Author
    {
        return $this->author;
    }

    public function setAuthor(Author $author): self
    {
        $this->author = $author;

        return $this;
    }
}
