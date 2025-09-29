<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class QuestionTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    public function __invoke(AbstractQuestion $question): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($question instanceof SimpleQuestion) {
            if (
                'preview' === $currentSchemaName
                && AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION === $question->getType()
            ) {
                return $this->typeResolver->resolve('PreviewMajorityQuestion');
            }

            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSimpleQuestion');
            }

            if (AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION === $question->getType()) {
                return $this->typeResolver->resolve('InternalMajorityQuestion');
            }

            return $this->typeResolver->resolve('InternalSimpleQuestion');
        }
        if ($question instanceof MediaQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewMediaQuestion');
            }

            return $this->typeResolver->resolve('InternalMediaQuestion');
        }
        if ($question instanceof MultipleChoiceQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewMultipleChoiceQuestion');
            }

            return $this->typeResolver->resolve('InternalMultipleChoiceQuestion');
        }
        if ($question instanceof SectionQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSectionQuestion');
            }

            return $this->typeResolver->resolve('InternalSectionQuestion');
        }

        throw new UserError('Could not resolve type of Question.');
    }
}
