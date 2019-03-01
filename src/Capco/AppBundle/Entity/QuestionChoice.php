<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="question_choice")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionChoiceRepository")
 */
class QuestionChoice
{
    use UuidTrait;
    use SluggableTitleTrait;
    use PositionableTrait;

    public static $availableColors = [
        'admin.fields.question_choice.colors.primary' => '#fffff',
        'admin.fields.question_choice.colors.success' => '#5cb85c',
        'admin.fields.question_choice.colors.info' => '#5bc0de',
        'admin.fields.question_choice.colors.warning' => '#f0ad4e',
        'admin.fields.question_choice.colors.danger' => '#d9534f',
    ];

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $image;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion", inversedBy="choices")
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id", nullable=false)
     */
    private $question;

    /**
     * @ORM\Column(name="color", type="string", nullable=true)
     */
    private $color;

    public function __toString()
    {
        return $this->title ?? 'New QuestionChoice';
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color = null): self
    {
        $this->color = $color;

        return $this;
    }

    public function getQuestion(): AbstractQuestion
    {
        return $this->question;
    }

    /**
     * @param AbstractQuestion $question
     *
     * @return $this
     */
    public function setQuestion(?AbstractQuestion $question): self
    {
        $this->question = $question;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getImage(): ?Media
    {
        return $this->image;
    }

    public function setImage(Media $image = null): self
    {
        $this->image = $image;

        return $this;
    }
}
