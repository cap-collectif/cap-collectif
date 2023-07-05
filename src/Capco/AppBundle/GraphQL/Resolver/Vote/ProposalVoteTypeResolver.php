<?php

namespace Capco\AppBundle\GraphQL\Resolver\Vote;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\ProposalCollectSmsVote;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionSmsVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ProposalVoteTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractProposalVote $vote): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($vote instanceof ProposalCollectVote || $vote instanceof ProposalSelectionVote) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposalVote');
            }

            return $this->typeResolver->resolve('InternalProposalUserVote');
        }

        if ($vote instanceof ProposalCollectSmsVote || $vote instanceof ProposalSelectionSmsVote) {
            return $this->typeResolver->resolve('InternalProposalSmsVote');
        }

        throw new UserError('Could not resolve type of ProposalVote.');
    }
}
