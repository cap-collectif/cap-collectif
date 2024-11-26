<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\Persister\ProjectPersister;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateAlphaProjectMutation implements MutationInterface
{
    use MutationTrait;
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly ProjectPersister $persister;

    public function __construct(ProjectPersister $persister, AuthorizationCheckerInterface $checker)
    {
        $this->persister = $persister;
        $this->authorizationChecker = $checker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $project = $this->persister->persist($input, $viewer, false);

        return ['project' => $project];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(ProjectVoter::CREATE, new Project());
    }
}
