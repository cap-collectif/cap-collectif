<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use ArrayObject;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class QuestionMajorityCountResolver implements ResolverInterface
{
    use ResolverTrait;

    protected ValueResponseRepository $valueResponseRepository;

    public function __construct(ValueResponseRepository $valueResponseRepository)
    {
        $this->valueResponseRepository = $valueResponseRepository;
    }

    public function __invoke(SimpleQuestion $question, $viewer, ?ArrayObject $context = null): int
    {
        $isAuthorized = $this->isAdminOrAuthorized($context, $viewer);

        if (!$isAuthorized) {
            throw new AccessDeniedException();
        }

        return $this->valueResponseRepository->countByQuestion($question);
    }
}
