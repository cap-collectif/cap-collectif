<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Answer;
use Doctrine\ORM\Mapping as ORM;

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
     * @param Answer $answer
     *
     * @return $this
     */
    public function setAnswer(?Answer $answer = null)
    {
        $this->answer = $answer;

        return $this;
    }
}
