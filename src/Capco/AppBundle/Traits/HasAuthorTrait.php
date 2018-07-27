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

    /**
     * @return mixed
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param mixed $author
     */
    public function setAuthor(User $author)
    {
        $this->author = $author;

        return $this;
    }
}
