<?php
namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;

class ProjectVisibilityStub
{
    protected $visibility;
    protected $author;

    use ProjectVisibilityTrait;

    public function __construct()
    {
    }

    public function getVisibility(): ?int
    {
        return $this->visibility;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setVisibility($visibility)
    {
        $this->visibility = $visibility;
    }

    public function setAuthor(?User $author)
    {
        $this->author = $author;
    }
}
