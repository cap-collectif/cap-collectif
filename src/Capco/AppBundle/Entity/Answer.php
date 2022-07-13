<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * Answer.
 *
 * @ORM\Table(name="answer")
 * @ORM\Entity()
 * @CapcoAssert\HasAuthor()
 */
class Answer implements Authorable
{
    use AuthorableTrait;
    use IdTrait;
    use TextableTrait;
    use TimestampableTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected ?User $author = null;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected \DateTime $updatedAt;

    /**
     * @ORM\Column(name="title", type="string", nullable=true)
     */
    protected ?string $title;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->createdAt = new \DateTime();
    }

    public function __toString(): string
    {
        if ($this->getTitle()) {
            return $this->getTitle();
        }

        return 'Answer';
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): self
    {
        $this->title = $title;

        return $this;
    }
}
