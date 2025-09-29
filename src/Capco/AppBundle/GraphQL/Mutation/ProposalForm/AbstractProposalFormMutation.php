<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractProposalFormMutation implements MutationInterface
{
    final public const NOT_FOUND = 'NOT_FOUND';

    public function __construct(
        protected EntityManagerInterface $em,
        protected GlobalIdResolver $globalIdResolver,
        protected AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    public function isGranted(string $id, ?User $viewer, string $accessType): bool
    {
        return $this->authorizationChecker->isGranted(
            $accessType,
            $this->getProposalForm($id, $viewer)
        );
    }

    protected function getProposalForm(string $id, ?User $viewer): ProposalForm
    {
        $proposalForm = $this->globalIdResolver->resolve($id, $viewer);

        if (!$proposalForm) {
            throw new UserError(self::NOT_FOUND);
        }

        return $proposalForm;
    }
}
