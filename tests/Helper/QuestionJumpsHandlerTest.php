<?php

namespace Capco\Tests\Helper;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Helper\QuestionJumpsHandler;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @internal
 *
 * @coversNothing
 */
class QuestionJumpsHandlerTest extends TestCase
{
    public function testEntityHasJumpsDetectsAlwaysJumpDestinationQuestion(): void
    {
        $handler = new QuestionJumpsHandler(
            $this->createMock(QuestionChoiceRepository::class),
            $this->createMock(AbstractQuestionRepository::class),
            $this->createMock(FormFactoryInterface::class),
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(AbstractQuestionRepository::class),
            $this->createMock(QuestionnaireAbstractQuestionRepository::class),
            $this->createMock(LoggerInterface::class),
            $this->createMock(ValidatorInterface::class),
            $this->createMock(MultipleChoiceQuestionRepository::class),
            $this->createMock(Indexer::class)
        );

        $origin = new SimpleQuestion();
        $origin->setAlwaysJumpDestinationQuestion(new SimpleQuestion());

        $questionnaire = new Questionnaire();
        $questionnaire->addQuestion((new QuestionnaireAbstractQuestion())->setQuestion($origin));

        $method = new \ReflectionMethod(QuestionJumpsHandler::class, 'entityHasJumps');
        $method->setAccessible(true);

        self::assertTrue($method->invoke($handler, $questionnaire));
    }
}
