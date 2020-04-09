<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Repository\PageRepository;
use Capco\AppBundle\Repository\ProposalAnalystRepository;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryViewerCanSeeEvaluationsPageResolver implements ResolverInterface
{
    use ResolverTrait;

    private $analystRepo;
    private $supervisorRepo;
    private $decisionMakerRepo;
    private $toggleManager;

    public function __construct(
        Manager $toggleManager,
        ProposalAnalystRepository $analystRepo,
        ProposalSupervisorRepository $supervisorRepo,
        ProposalDecisionMakerRepository $decisionMakerRepo
        )
    {
        $this->toggleManager = $toggleManager;
        $this->analystRepo = $analystRepo;
        $this->supervisorRepo = $supervisorRepo;
        $this->decisionMakerRepo = $decisionMakerRepo;
    }

    /**
     * A user that can access "Evaluations page" is a user that is assigned to at least
     * one proposal, as analyst, supervisor or decision marker.
     */
    public function __invoke($viewer): bool
    {
        $this->preventNullableViewer($viewer);

        if (!$this->toggleManager->isActive('unstable__analysis')) {
            return false;
        }

        if (count($this->analystRepo->findBy(['analyst' => $viewer])) > 0) {
            return true;
        }

        if (count($this->supervisorRepo->findBy(['supervisor' => $viewer])) > 0) {
            return true;
        }

        if (count($this->decisionMakerRepo->findBy(['decisionMaker' => $viewer])) > 0) {
            return true;
        }

        return false;
    }
}
