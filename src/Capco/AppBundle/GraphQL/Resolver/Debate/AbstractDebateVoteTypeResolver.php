<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AbstractDebateVoteTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    /**
     * @param DebateAnonymousVote|DebateVote $vote
     */
    public function __invoke($vote): Type
    {
        if ($vote instanceof DebateVote) {
            return $this->typeResolver->resolve('InternalDebateVote');
        }
        if ($vote instanceof DebateAnonymousVote) {
            return $this->typeResolver->resolve('InternalDebateAnonymousVote');
        }

        throw new UserError('Could not resolve type of AbstractDebateVote.');
    }
}
