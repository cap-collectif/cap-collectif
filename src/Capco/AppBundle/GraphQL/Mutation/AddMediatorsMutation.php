<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediatorRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddMediatorsMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly GlobalIdResolver $globalIdResolver, private readonly MediatorRepository $mediatorRepository, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly ConnectionBuilderInterface $connectionBuilder, private readonly Manager $manager, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $usersId = $input->offsetGet('usersId');
        $stepId = $input->offsetGet('stepId');

        $step = $this->getStep($stepId, $viewer);

        $mediators = [];

        foreach ($usersId as $userId) {
            $user = $this->getUser($userId, $viewer);
            $mediator = $this->getMediator($user, $step);
            $mediators[] = $mediator;
        }

        $this->em->flush();

        return [
            'mediators' => $this->connectionBuilder->connectionFromArray($mediators),
            'step' => $step,
        ];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        $isFeatureFlagEnabled = $this->manager->isActive('mediator');

        if (!$isFeatureFlagEnabled) {
            throw new UserError('Feature flag mediator must be enabled');
        }

        if (!$viewer) {
            return false;
        }

        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    private function getUser(string $userId, User $viewer): User
    {
        $user = $this->globalIdResolver->resolve($userId, $viewer);
        if (!$user instanceof User) {
            throw new \Exception("User not found for id : {$userId}");
        }

        $user->addRole(UserRole::ROLE_MEDIATOR);
        $this->indexer->index(User::class, $user->getId());
        $this->indexer->finishBulk();

        return $user;
    }

    private function getStep(string $stepId, User $viewer): AbstractStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (false === $step instanceof AbstractStep) {
            throw new \Exception("Step not found for id : {$stepId}");
        }

        if (false === $step instanceof CollectStep && false === $step instanceof SelectionStep) {
            $stepType = $step::class;

            throw new \Exception("Step should be either CollectStep or SelectionStep {$stepType} given");
        }

        return $step;
    }

    private function getMediator(User $user, AbstractStep $step): Mediator
    {
        $mediator = $this->mediatorRepository->findOneBy(['user' => $user, 'step' => $step]);

        if ($mediator) {
            return $mediator;
        }

        $mediator = (new Mediator())
            ->setUser($user)
            ->setStep($step)
        ;

        $this->em->persist($mediator);

        return $mediator;
    }
}
