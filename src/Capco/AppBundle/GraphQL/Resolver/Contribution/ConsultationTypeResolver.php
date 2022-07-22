<?php

namespace Capco\AppBundle\GraphQL\Resolver\Contribution;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Vote\VoteTypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class ConsultationTypeResolver implements ResolverInterface
{
    private $typeResolver;
    private ReplyTypeResolver $replyTypeResolver;
    private VoteTypeResolver $voteTypeResolver;

    public function __construct(
        TypeResolver $typeResolver,
        ReplyTypeResolver $replyTypeResolver,
        VoteTypeResolver $voteTypeResolver
    ) {
        $this->typeResolver = $typeResolver;
        $this->replyTypeResolver = $replyTypeResolver;
        $this->voteTypeResolver = $voteTypeResolver;
    }

    public function __invoke($data)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

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
        if ($data instanceof OpinionVersionVote) {
            return $this->typeResolver->resolve('VersionVote');
        }
        if ($data instanceof Argument) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewArgument');
            }

            return $this->typeResolver->resolve('InternalArgument');
        }
        if ($data instanceof Source) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSource');
            }

            return $this->typeResolver->resolve('InternalSource');
        }
        if ($data instanceof Reporting) {
            return $this->typeResolver->resolve('Reporting');
        }
        if ($data instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }
        if ($data instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($data instanceof ProposalSelectionVote || $data instanceof ProposalCollectVote) {
            return $this->typeResolver->resolve('InternalProposalUserVote');
        }
        if ($data instanceof Reply) {
            return $this->replyTypeResolver->__invoke($data);
        }
        if ($data instanceof Answer) {
            return $this->typeResolver->resolve('Answer');
        }
        if ($data instanceof Post) {
            return $this->typeResolver->resolve('Post');
        }
        if ($data instanceof DebateArgument) {
            return $this->typeResolver->resolve('InternalDebateArgument');
        }
        if ($data instanceof DebateAnonymousArgument) {
            return $this->typeResolver->resolve('InternalDebateAnonymousArgument');
        }
        if ($data instanceof AbstractVote) {
            return $this->voteTypeResolver->__invoke($data);
        }

        throw new UserError('Could not resolve type of Contribution.');
    }
}
