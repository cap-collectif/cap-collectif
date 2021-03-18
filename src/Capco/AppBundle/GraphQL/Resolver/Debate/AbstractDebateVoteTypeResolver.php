<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class AbstractDebateVoteTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    /**
     * @param DebateVote|DebateAnonymousVote $vote
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
