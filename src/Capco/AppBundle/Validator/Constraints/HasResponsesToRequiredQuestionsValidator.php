<?php

namespace Capco\AppBundle\Validator\Constraints;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\LogicJump;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraint;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Enum\LogicJumpConditionOperator;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\Validator\ConstraintValidator;
use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Repository\RegistrationFormRepository;

class HasResponsesToRequiredQuestionsValidator extends ConstraintValidator
{
    public const LOG_PREFIX_FOUND_QUESTIONS_TO_VALIDATE = 'Validator found questions to validate: ';
    public const LOGIC_JUMP_OPERATOR_NOT_SUPPORTED = 'Logic jump operator not implemented.';
    protected $formRepo;

    public function __construct(RegistrationFormRepository $formRepo, LoggerInterface $logger)
    {
        $this->formRepo = $formRepo;
        $this->logger = $logger;
    }

    public function validate($object, Constraint $constraint)
    {
        // We skip validation for drafts.
        if ($object instanceof Reply && $object->isDraft()) {
            return;
        }
        $questions = $this->getQuestions($constraint, $object);
        $responses = $object->getResponsesArray();

        if (!$this->questionsHaveAtLeastOneLogicJump($questions)) {
            // We don't have any jump,
            // so we can run validation on every questions
            // easy peasy.
            return $this->validateQuestions($questions, $responses, $constraint);
        }

        // Here things are more complicated,
        // because of jumps we must guess which questions are
        // available for the user.
        $firstLogicJumpQuestion = $this->getFirstLogicJumpQuestion($questions);
        $questionsAvailableBeforeAnyLogicJump = $this->getQuestionsAvailableBeforeAnyLogicJump(
            $questions,
            $firstLogicJumpQuestion
        );

        // We get all the fulfilled questions ids (the questions that have met all the conditions)
        $fulfilledQuestions = [];
        foreach ($questions as $question) {
            // Is the question available to the user ?
            if (
                \in_array(
                    $question->getId(),
                    array_map(function ($q) {
                        return $q->getId();
                    }, array_merge($questionsAvailableBeforeAnyLogicJump, $fulfilledQuestions))
                )
            ) {
                if ($this->isAnyJumpFulfilledForQuestion($question, $responses)) {
                    $fulfilledJump = null;
                    foreach ($question->getJumps() as $jump) {
                        if ($this->isJumpFulfilledForQuestion($jump, $responses)) {
                            $fulfilledJump = $jump;

                            break;
                        }
                    }
                    if ($fulfilledJump) {
                        $fulfilledQuestions[] = $fulfilledJump->getDestination();
                    } else {
                        if ($question->hasAlwaysJumpDestinationQuestion()) {
                            $fulfilledQuestions[] = $question->getAlwaysJumpDestinationQuestion();
                        }
                    }
                }
            }
        }

        // Questions that must be validated
        $questionsToValidate = array_merge(
            $questionsAvailableBeforeAnyLogicJump,
            $fulfilledQuestions
        );
        $this->logger->debug(
            self::LOG_PREFIX_FOUND_QUESTIONS_TO_VALIDATE .
                json_encode(
                    array_map(function ($q) {
                        return $q->getId();
                    }, $questionsToValidate)
                )
        );

        return $this->validateQuestions($questionsToValidate, $responses, $constraint);
    }

    private function questionsHaveAtLeastOneLogicJump(iterable $questions): bool
    {
        foreach ($questions as $question) {
            if (
                \count($question->getJumps()) > 0 ||
                $question->hasAlwaysJumpDestinationQuestion()
            ) {
                return true;
            }
        }

        return false;
    }

    private function getFirstLogicJumpQuestion(iterable $questions): AbstractQuestion
    {
        foreach ($questions as $question) {
            if (\count($question->getJumps()) > 0) {
                return $question;
            }
        }

        throw new \RuntimeException('Should not be called if no logic jump.', 1);
    }

    private function getQuestionsAvailableBeforeAnyLogicJump(
        iterable $questions,
        AbstractQuestion $firstLogicJumpQuestion
    ): iterable {
        $indexOfFirstLogicJumpQuestion = array_search(
            $firstLogicJumpQuestion->getId(),
            array_map(function ($q) {
                return $q->getId();
            }, $questions)
        );

        return \array_slice($questions, 0, $indexOfFirstLogicJumpQuestion + 1);
    }

    private function isConditionFulfilled(
        AbstractQuestion $question,
        AbstractResponse $response,
        AbstractLogicJumpCondition $condition
    ): bool {
        /** @var QuestionChoice $value */
        $value = $condition->getValue();

        if (!$value) {
            return true;
        }

        switch ($condition->getOperator()) {
            case LogicJumpConditionOperator::IS:
                switch ($question->getType()) {
                    case AbstractQuestion::QUESTION_TYPE_SELECT:
                        return $value->getTitle() === $response->getValue();
                    case AbstractQuestion::QUESTION_TYPE_RADIO:
                    case AbstractQuestion::QUESTION_TYPE_CHECKBOX:
                    case AbstractQuestion::QUESTION_TYPE_BUTTON:
                        return \in_array($value->getTitle(), $response->getValue()['labels'], true);
                    default:
                        throw new \RuntimeException(
                            self::LOGIC_JUMP_OPERATOR_NOT_SUPPORTED .
                                ' ' .
                                $question->getType() .
                                ' is not supported for operator ' .
                                $condition->getOperator()
                        );

                        break;
                }

                break;
            case LogicJumpConditionOperator::IS_NOT:
                switch ($question->getType()) {
                    case AbstractQuestion::QUESTION_TYPE_SELECT:
                        return $value->getTitle() != $response->getValue();
                    case AbstractQuestion::QUESTION_TYPE_RADIO:
                    case AbstractQuestion::QUESTION_TYPE_CHECKBOX:
                    case AbstractQuestion::QUESTION_TYPE_BUTTON:
                        return !\in_array(
                            $value->getTitle(),
                            $response->getValue()['labels'],
                            true
                        );
                    default:
                        throw new \RuntimeException(
                            self::LOGIC_JUMP_OPERATOR_NOT_SUPPORTED .
                                ' ' .
                                $question->getType() .
                                ' is not supported for operator ' .
                                $condition->getOperator()
                        );

                        break;
                }

                break;
            default:
                throw new \RuntimeException(
                    self::LOGIC_JUMP_OPERATOR_NOT_SUPPORTED .
                        ' Unknown operator: ' .
                        $condition->getOperator()
                );

                break;
        }
    }

    private function isJumpFulfilledForQuestion(LogicJump $jump, iterable $responses): bool
    {
        foreach ($jump->getConditions() as $condition) {
            $conditionQuestion = $condition->getQuestion();
            $responseOnConditionQuestion = $this->getResponseForQuestion(
                $conditionQuestion,
                $responses
            );
            if (!$responseOnConditionQuestion) {
                return false;
            }

            if (
                !$this->isConditionFulfilled(
                    $conditionQuestion,
                    $responseOnConditionQuestion,
                    $condition
                )
            ) {
                // One condition is not fulfilled.
                return false;
            }
        }

        return true;
    }

    private function isAnyJumpFulfilledForQuestion(
        AbstractQuestion $question,
        iterable $responses
    ): bool {
        if ($question->hasAlwaysJumpDestinationQuestion()) {
            return true;
        }

        if (0 === \count($question->getJumps())) {
            return false;
        }

        foreach ($question->getJumps() as $jump) {
            if ($this->isJumpFulfilledForQuestion($jump, $responses)) {
                return true;
            }
        }

        return false;
    }

    private function validateQuestions(
        iterable $questionsToValidate,
        iterable $responses,
        Constraint $constraint
    ): void {
        foreach ($questionsToValidate as $question) {
            if ($question->isRequired() && !$this->hasResponseForQuestion($question, $responses)) {
                $this->context
                    ->buildViolation($constraint->message)
                    ->atPath('responses')
                    ->setParameter('missing', $question->getId())
                    ->addViolation();

                return;
            }
        }
    }

    private function getQuestions(Constraint $constraint, $object): iterable
    {
        $questionsQaq = [];
        if ('registrationForm' === $constraint->formField) {
            $form = $this->formRepo->findCurrent();

            $questionsQaq = $form->getQuestionsArray();
        } else {
            $accessor = PropertyAccess::createPropertyAccessor();
            $form = $accessor->getValue($object, $constraint->formField);

            $questionsQaq = $form->getQuestionsArray();
        }

        usort($questionsQaq, function ($a, $b) {
            return $a->getPosition() <=> $b->getPosition();
        });

        // Turn qaq into questions
        $questions = [];
        foreach ($questionsQaq as $qaq) {
            $questions[] = $qaq->getQuestion();
        }

        return $questions;
    }

    private function getResponseForQuestion(
        AbstractQuestion $question,
        iterable $responses
    ): ?AbstractResponse {
        foreach ($responses as $response) {
            if ($response->getQuestion() === $question) {
                return $response;
            }
        }

        return null;
    }

    private function hasResponseForQuestion(AbstractQuestion $question, iterable $responses): bool
    {
        foreach ($responses as $response) {
            if ($response->getQuestion() === $question) {
                if ($response instanceof MediaResponse) {
                    return $response->getMedias()->count() > 0;
                }

                $value = $response->getValue();

                if ($value instanceof Collection && $value->count() > 0) {
                    return true;
                }

                if (
                    \is_array($value) &&
                    (\count($value['labels']) > 0 || null !== $value['other'])
                ) {
                    return true;
                }
                if (\is_string($value) && '' !== $value) {
                    return true;
                }

                return false;
            }
        }

        return false;
    }
}
