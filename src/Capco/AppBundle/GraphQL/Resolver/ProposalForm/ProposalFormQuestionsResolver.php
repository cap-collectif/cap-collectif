<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormQuestionsResolver implements QueryInterface
{
    private $repository;

    public function __construct(AbstractQuestionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(ProposalForm $form): iterable
    {
        return $this->repository->findByProposalForm($form);
    }
}
