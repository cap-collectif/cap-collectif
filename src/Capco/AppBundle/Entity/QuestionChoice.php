<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;

/**
 * QuestionChoice.
 *
 * @ORM\Table(name="question_choice")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionChoiceRepository")
 */
class QuestionChoice
{
    use SluggableTitleTrait;
    use PositionableTrait;

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @var Media
     *
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $image;

    /**
     * @var Question
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion", inversedBy="questionChoices", cascade={"persist"})
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id")
     */
    private $question;

    public function __toString()
    {
        if ($this->title) {
            return $this->title;
        }

        return 'New QuestionChoice';
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return Question
     */
    public function getQuestion()
    {
        return $this->question;
    }

    /**
     * @param AbstractQuestion $question
     *
     * @return $this
     */
    public function setQuestion(AbstractQuestion $question)
    {
        $this->question = $question;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return Media
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @param Media $image
     *
     * @return $this
     */
    public function setImage(Media $image = null)
    {
        $this->image = $image;

        return $this;
    }
}
