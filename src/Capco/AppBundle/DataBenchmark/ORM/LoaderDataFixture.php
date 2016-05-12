<?php

namespace Capco\AppBundle\DataBenchmark\ORM;

use Hautelook\AliceBundle\Alice\DataFixtureLoader;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;

class LoaderDataFixture extends DataFixtureLoader implements OrderedFixtureInterface
{
    public function getOrder()
    {
        return 1;
    }

    /**
     * {@inheritdoc}
     */
    protected function getFixtures()
    {
        return [
            __DIR__.'/User.yml',
            __DIR__.'/QuestionnaireStep.yml',
            __DIR__.'/Project.yml',
            __DIR__.'/ProjectAbstractStep.yml',
            __DIR__.'/Questionnaire.yml',
            __DIR__.'/QuestionChoice.yml',
            __DIR__.'/MultipleChoiceQuestion.yml',
            __DIR__.'/QuestionnaireAbstractQuestion.yml',
            __DIR__.'/Reply.yml',
            __DIR__.'/Response.yml',
        ];
    }
}
