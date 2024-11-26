<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use ArrayObject;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class QuestionMajorityResponsesByChoicesResolver implements QueryInterface
{
    use ResolverTrait;

    protected ValueResponseRepository $valueResponseRepository;
    private readonly AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        ValueResponseRepository $valueResponseRepository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->valueResponseRepository = $valueResponseRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(
        SimpleQuestion $question,
        User $viewer,
        ?ArrayObject $context = null
    ): array {
        return $this->valueResponseRepository->countByValue($question->getId());
    }

    public function isGranted(SimpleQuestion $question): bool
    {
        return $this->authorizationChecker->isGranted(
            QuestionnaireVoter::EXPORT,
            $question->getQuestionnaire()
        );
    }
}
