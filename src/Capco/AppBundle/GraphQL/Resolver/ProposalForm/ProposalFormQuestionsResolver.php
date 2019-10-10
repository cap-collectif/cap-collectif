<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormQuestionsResolver implements ResolverInterface
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
