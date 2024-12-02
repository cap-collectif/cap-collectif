<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteMediatorMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly Manager $manager, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $mediatorId = $input->offsetGet('mediatorId');
        $mediator = $this->getMediator($mediatorId, $viewer);

        $user = $mediator->getUser();
        $user->removeRole(UserRole::ROLE_MEDIATOR);

        $this->em->remove($mediator);
        $this->em->flush();

        $this->indexer->index(User::class, $user->getId());
        $this->indexer->finishBulk();

        return [
            'deletedMediatorId' => $mediatorId,
        ];
    }

    public function isGranted(string $mediatorId, ?User $viewer = null): bool
    {
        $isFeatureFlagEnabled = $this->manager->isActive('mediator');

        if (!$isFeatureFlagEnabled) {
            throw new UserError('Feature flag mediator must be enabled');
        }

        if (!$viewer) {
            return false;
        }

        $mediator = $this->getMediator($mediatorId, $viewer);
        $step = $mediator->getStep();
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    private function getMediator(string $mediatorId, User $viewer): Mediator
    {
        $mediator = $this->globalIdResolver->resolve($mediatorId, $viewer);

        if (false === $mediator instanceof Mediator) {
            throw new \Exception("Mediator not found for id : {$mediatorId}");
        }

        return $mediator;
    }
}
