<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\HasAuthorTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Answer.
 *
 * @ORM\Table(name="answer")
 * @ORM\Entity()
 */
class Answer
{
    use TimestampableTrait;
    use HasAuthorTrait;
    use IdTrait;
    use TextableTrait;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="title", type="string", nullable=true)
     */
    protected $title;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->createdAt = new \DateTime();
    }

    public function __toString(): ?string
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
