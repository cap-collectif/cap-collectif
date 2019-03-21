<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;

class QuestionTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractQuestion $question): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($question instanceof SimpleQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSimpleQuestion');
            }
            return $this->typeResolver->resolve('InternalSimpleQuestion');
        }
        if ($question instanceof MediaQuestion) {
            return $this->typeResolver->resolve('MediaQuestion');
        }
        if ($question instanceof MultipleChoiceQuestion) {
            return $this->typeResolver->resolve('MultipleChoiceQuestion');
        }
        if ($question instanceof SectionQuestion) {
            return $this->typeResolver->resolve('SectionQuestion');
        }

        throw new UserError('Could not resolve type of Question.');
    }
}
