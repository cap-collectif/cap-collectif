<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\HasAuthorTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\IdTrait;

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

    /**
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    protected $body;

    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->createdAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->getTitle()) {
            return $this->getTitle();
        }

        return 'Answer';
    }

    /**
     * @return mixed
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param mixed $title
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param mixed $body
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }
}
