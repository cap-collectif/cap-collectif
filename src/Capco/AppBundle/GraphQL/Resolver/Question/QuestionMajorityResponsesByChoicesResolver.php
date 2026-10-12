<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use ArrayObject;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionMajorityResponsesByChoicesResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        protected ValueResponseRepository $valueResponseRepository,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(
        SimpleQuestion $question,
        ?User $viewer,
        ?ArrayObject $context = null
    ): array {
        return $this->resultsAccess->canViewResults($question->getQuestionnaire(), $context)
            ? $this->valueResponseRepository->countByValue($question->getId())
            : [];
    }
}
