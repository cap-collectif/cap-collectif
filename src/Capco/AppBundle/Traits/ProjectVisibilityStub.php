<?php

namespace Capco\AppBundle\Traits;

use Doctrine\Common\Collections\Collection;

class ProjectVisibilityStub
{
    use ProjectVisibilityTrait;
    protected $visibility;
    protected $authors;

    public function __construct()
    {
    }

    public function getVisibility(): ?int
    {
        return $this->visibility;
    }

    public function getAuthors(): Collection
    {
        return $this->authors;
    }

    public function setVisibility($visibility)
    {
        $this->visibility = $visibility;
    }

    public function setAuthors(Collection $authors)
    {
        $this->authors = $authors;
    }
}
