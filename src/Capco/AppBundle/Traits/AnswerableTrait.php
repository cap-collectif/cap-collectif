<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Answer;

trait AnswerableTrait
{
    /**
     * @ORM\OneToOne(targetEntity="Answer", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\JoinColumn(name="answer_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    protected $answer;

    /**
     * @return mixed
     */
    public function getAnswer()
    {
        return $this->answer;
    }

    /**
     * @param mixed $answer
     */
    public function setAnswer(Answer $answer = null)
    {
        $this->answer = $answer;

        return $this;
    }
}
