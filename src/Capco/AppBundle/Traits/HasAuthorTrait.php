<?php
namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait HasAuthorTrait
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    protected $author;

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author)
    {
        $this->author = $author;

        return $this;
    }
}
