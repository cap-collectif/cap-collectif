<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait AuthorableTrait
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization")
     * @ORM\JoinColumn(name="organization_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?Organization $organization = null;

    public function getAuthor(): ?Author
    {
        return $this->author ?: $this->organization;
    }

    public function viewerDidAuthor(User $viewer): bool
    {
        return $this->getAuthor() === $viewer;
    }

    public function setAuthor(?Author $author): self
    {
        if ($author instanceof User) {
            $this->author = $author;
        }
        if ($author instanceof Organization) {
            $this->organization = $author;
        }

        return $this;
    }

    public function getAuthorType(): string
    {
        return $this->getAuthor() instanceof User ? 'User' : 'Organization';
    }
}
