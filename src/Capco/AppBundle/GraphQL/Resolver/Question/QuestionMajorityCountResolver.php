<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use ArrayObject;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class QuestionMajorityCountResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(protected ValueResponseRepository $valueResponseRepository, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(SimpleQuestion $question, $viewer, ?ArrayObject $context = null): int
    {
        return $this->valueResponseRepository->countByQuestion($question);
    }

    public function isGranted(SimpleQuestion $question): bool
    {
        return $this->authorizationChecker->isGranted(
            QuestionnaireVoter::EXPORT,
            $question->getQuestionnaire()
        );
    }
}
