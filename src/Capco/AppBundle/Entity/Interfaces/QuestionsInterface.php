<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Doctrine\Common\Collections\Collection;

interface QuestionsInterface
{
    /**
     * @return Collection<int, QuestionnaireAbstractQuestion>
     */
    public function getQuestions(): Collection;
}
