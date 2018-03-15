<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Psr\Log\LoggerInterface;

class NodeTypeResolver implements ResolverInterface
{
    private $typeResolver;
    private $logger;

    public function __construct(TypeResolver $typeResolver, LoggerInterface $logger)
    {
        $this->typeResolver = $typeResolver;
        $this->logger = $logger;
    }

    public function __invoke($node)
    {
        if ($node instanceof Project) {
            return $this->typeResolver->resolve('Project');
        }
        if ($node instanceof Questionnaire) {
            return $this->typeResolver->resolve('Questionnaire');
        }
        if ($node instanceof Opinion) {
            return $this->typeResolver->resolve('Opinion');
        }
        if ($node instanceof OpinionType) {
            return $this->typeResolver->resolve('Section');
        }
        if ($node instanceof Proposal) {
            return $this->typeResolver->resolve('Proposal');
        }
        if ($node instanceof OpinionVersion) {
            return $this->typeResolver->resolve('Version');
        }
        if ($node instanceof Argument) {
            return $this->typeResolver->resolve('Argument');
        }
        if ($node instanceof Source) {
            return $this->typeResolver->resolve('Source');
        }
        if ($node instanceof Reporting) {
            return $this->typeResolver->resolve('Reporting');
        }

        if ($node instanceof ProposalForm) {
            return $this->typeResolver->resolve('ProposalForm');
        }

        if ($node instanceof Group) {
            return $this->typeResolver->resolve('Group');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
