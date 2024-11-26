<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormMessagesSentResolver implements QueryInterface
{
    private readonly ProposalFormRepository $repository;

    public function __construct(ProposalFormRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(ProposalForm $form): int
    {
        return $this->repository->getNumberOfMessagesSent($form);
    }
}
