<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProposalFormMutation
{
    private $em;
    private $formFactory;
    private $proposalFormRepo;
    private $logger;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, ProposalFormRepository $proposalFormRepo, LoggerInterface $logger)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalFormRepo = $proposalFormRepo;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['proposalFormId'];

        $proposalForm = $this->proposalFormRepo->find($id);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%s"', $id));
        }
        unset($arguments['proposalFormId']);

        $form = $this->formFactory->create(ProposalFormUpdateType::class, $proposalForm);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));
            throw new UserError('Can\'t update this proposal form!');
        }

        $this->em->flush();

        return ['proposalForm' => $proposalForm];
    }
}
