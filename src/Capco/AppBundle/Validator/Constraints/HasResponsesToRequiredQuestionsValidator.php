<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Capco\AppBundle\Entity\Reply;

class HasResponsesToRequiredQuestionsValidator extends ConstraintValidator
{
    protected $formRepo;

    public function __construct(RegistrationFormRepository $formRepo)
    {
        $this->formRepo = $formRepo;
    }

    public function validate($object, Constraint $constraint)
    {
        if ($object instanceof Reply && $object->isDraft()) {
            return;
        }
        $questions = $this->getQuestions($constraint, $object);
        $responses = $object->getResponses();
        foreach ($questions as $qaq) {
            $question = $qaq->getQuestion();
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

    private function getQuestions(Constraint $constraint, $object)
    {
        if ('registrationForm' === $constraint->formField) {
            $form = $this->formRepo->findCurrent();

            return $form->getQuestions();
        }
        $accessor = PropertyAccess::createPropertyAccessor();
        $form = $accessor->getValue($object, $constraint->formField);

        return $form->getQuestions();
    }

    private function hasResponseForQuestion(AbstractQuestion $question, $responses): bool
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
