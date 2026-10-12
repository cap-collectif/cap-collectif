<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use ArrayObject;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionMajorityCountResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        protected ValueResponseRepository $valueResponseRepository,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(SimpleQuestion $question, $viewer, ?ArrayObject $context = null): int
    {
        return $this->resultsAccess->canViewResults($question->getQuestionnaire(), $context)
            ? $this->valueResponseRepository->countByQuestion($question)
            : 0;
    }
}
