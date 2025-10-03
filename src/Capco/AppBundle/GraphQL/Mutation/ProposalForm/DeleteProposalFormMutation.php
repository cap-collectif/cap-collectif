<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteProposalFormMutation extends AbstractProposalFormMutation
{
    use MutationTrait;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        private readonly ActionLogger $actionLogger
    ) {
        parent::__construct($em, $globalIdResolver, $authorizationChecker);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $id = $input->offsetGet('id');
            $proposalForm = $this->getProposalForm($id, $viewer);

            $proposalFormId = $proposalForm->getId();
            $title = $proposalForm->getTitle();

            $actionDescription = sprintf('le formulaire de dépôt %s', $title);

            if (null !== $proposalForm->getProject()) {
                $projectTitle = $proposalForm->getProject()->getTitle();
                $actionDescription .= sprintf(' du projet %s', $projectTitle);
            }

            $this->actionLogger->logGraphQLMutation(
                $viewer,
                LogActionType::DELETE,
                $actionDescription,
                ProposalForm::class,
                $proposalFormId
            );

            $this->em->remove($proposalForm);
            $this->em->flush();
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['deletedProposalFormId' => $id];
    }
}
