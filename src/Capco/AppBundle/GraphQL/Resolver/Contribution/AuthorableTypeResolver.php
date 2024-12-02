<?php

namespace Capco\AppBundle\GraphQL\Resolver\Contribution;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Vote\VoteTypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AuthorableTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver, private readonly ReplyTypeResolver $replyTypeResolver, private readonly VoteTypeResolver $voteTypeResolver)
    {
    }

    public function __invoke($data)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($data instanceof Argument) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewArgument');
            }

            return $this->typeResolver->resolve('InternalArgument');
        }
        if ($data instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($data instanceof AbstractVote) {
            return $this->voteTypeResolver->__invoke($data);
        }
        if ($data instanceof OpinionVersionVote) {
            return $this->typeResolver->resolve('VersionVote');
        }
        if ($data instanceof Source) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSource');
            }

            return $this->typeResolver->resolve('InternalSource');
        }
        if ($data instanceof Reply) {
            return $this->replyTypeResolver->__invoke($data);
        }
        if ($data instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }
        if ($data instanceof DebateArgument) {
            return $this->typeResolver->resolve('InternalDebateArgument');
        }
        if ($data instanceof Opinion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewOpinion');
            }

            return $this->typeResolver->resolve('InternalOpinion');
        }
        if ($data instanceof OpinionVersion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewVersion');
            }

            return $this->typeResolver->resolve('InternalVersion');
        }
        if ($data instanceof Event) {
            return $this->typeResolver->resolve('InternalEvent');
        }
        if ($data instanceof DebateOpinion) {
            return $this->typeResolver->resolve('InternalDebateOpinion');
        }
        if ($data instanceof DebateAnonymousArgument) {
            return $this->typeResolver->resolve('InternalDebateAnonymousArgument');
        }

        throw new UserError('Could not resolve type of Authorable.');
    }
}
