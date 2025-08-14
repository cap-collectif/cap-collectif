<?php

namespace Capco\AppBundle\GraphQL\Resolver\Vote;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgumentVote;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Error\UserError;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class VoteTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(AbstractVote $node): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof OpinionVote) {
            return $this->typeResolver->resolve('OpinionVote');
        }
        if ($node instanceof ProposalCollectVote) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposalVote');
            }

            return $this->typeResolver->resolve('InternalProposalVote');
        }
        if ($node instanceof ProposalSelectionVote) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposalVote');
            }

            return $this->typeResolver->resolve('InternalProposalVote');
        }
        if ($node instanceof OpinionVersionVote) {
            return $this->typeResolver->resolve('VersionVote');
        }
        if ($node instanceof ArgumentVote) {
            return $this->typeResolver->resolve('ArgumentVote');
        }
        if ($node instanceof SourceVote) {
            return $this->typeResolver->resolve('SourceVote');
        }
        if ($node instanceof CommentVote) {
            return $this->typeResolver->resolve('CommentVote');
        }
        if ($node instanceof DebateVote) {
            return $this->typeResolver->resolve('InternalDebateVote');
        }
        if ($node instanceof DebateArgumentVote || $node instanceof DebateAnonymousArgumentVote) {
            return $this->typeResolver->resolve('InternalDebateArgumentVote');
        }

        throw new UserError('Could not resolve type of Vote.');
    }
}
