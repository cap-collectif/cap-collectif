<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Doctrine\Common\Collections\Collection;

interface QuestionnableForm
{
    public function getRealQuestions(): Collection;

    public function getQuestions(): Collection;

    public function getQuestionsArray(): array;

}
