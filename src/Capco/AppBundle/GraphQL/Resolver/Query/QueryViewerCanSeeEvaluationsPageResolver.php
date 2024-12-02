<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalAnalystRepository;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryViewerCanSeeEvaluationsPageResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private Manager $toggleManager, private ProposalAnalystRepository $analystRepo, private ProposalSupervisorRepository $supervisorRepo, private ProposalDecisionMakerRepository $decisionMakerRepo)
    {
    }

    /**
     * A user that can access "Evaluations page" is a user that is assigned to at least
     * one proposal, as analyst, supervisor or decision marker.
     */
    public function __invoke(mixed $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        if (\count($this->analystRepo->findBy(['analyst' => $viewer])) > 0) {
            return true;
        }

        if (\count($this->supervisorRepo->findBy(['supervisor' => $viewer])) > 0) {
            return true;
        }

        if (\count($this->decisionMakerRepo->findBy(['decisionMaker' => $viewer])) > 0) {
            return true;
        }

        return false;
    }
}
