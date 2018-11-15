<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface QuestionnableForm
{
    public function getRealQuestions(): iterable;

    public function getQuestions(): iterable;
}
