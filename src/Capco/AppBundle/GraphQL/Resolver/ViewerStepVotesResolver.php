<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ViewerStepVotesResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly ViewerProposalVotesDataLoader $dataLoader,
        private readonly RequestStack $requestStack
    ) {}

    public function __invoke(AbstractStep $step, $user, Argument $args): Promise
    {
        $args->offsetSet('stepId', $step->getId());
        if (!$user && !$args->offsetGet('token')) {
            $args->offsetSet(
                'token',
                $this->requestStack->getCurrentRequest()?->cookies->get(ParticipationCookieManager::PARTICIPANT_COOKIE)
            );
        }

        return $this->dataLoader->load(compact('user', 'args'));
    }
}
