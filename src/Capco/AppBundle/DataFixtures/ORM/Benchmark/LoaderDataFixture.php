<?php

namespace Capco\AppBundle\DataBenchmark\ORM;

use Hautelook\AliceBundle\Doctrine\DataFixtures\AbstractLoader;

class LoaderDataFixture extends AbstractLoader
{
    public function getFixtures()
    {
        return [
            __DIR__ . '/User.yml',
            __DIR__ . '/QuestionnaireStep.yml',
            __DIR__ . '/ConsultationStepType.yml',
            __DIR__ . '/ConsultationStep.yml',
            __DIR__ . '/Project.yml',
            __DIR__ . '/ProjectAbstractStep.yml',
            __DIR__ . '/Questionnaire.yml',
            __DIR__ . '/QuestionChoice.yml',
            __DIR__ . '/MultipleChoiceQuestion.yml',
            __DIR__ . '/QuestionnaireAbstractQuestion.yml',
            __DIR__ . '/Reply.yml',
            __DIR__ . '/Response.yml',
            __DIR__ . '/OpinionType.yml',
            __DIR__ . '/Opinion.yml',
        ];
    }
}
