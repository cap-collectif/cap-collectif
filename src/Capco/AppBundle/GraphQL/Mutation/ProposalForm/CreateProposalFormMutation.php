<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\ProposalFormCreateType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\ProposalFormVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateProposalFormMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly FormFactoryInterface $formFactory,
        private readonly EntityManagerInterface $em,
        private readonly SettableOwnerResolver $settableOwnerResolver,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly ActionLogger $actionLogger
    ) {
    }

    public function __invoke(Argument $input, User $viewer, bool $toLogUserAction = true): array
    {
        $this->formatInput($input);
        $proposalForm = new ProposalForm();
        $proposalForm->setDescriptionUsingJoditWysiwyg(true);

        $form = $this->formFactory->create(ProposalFormCreateType::class, $proposalForm);

        $data = $input->getArrayCopy();
        unset($data['owner']);
        $form->submit($data, false);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $proposalForm->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );
        $proposalForm->setCreator($viewer);
        $proposalForm->setAllowAknowledge(true);

        $this->em->persist($proposalForm);
        $this->em->flush();

        if ($toLogUserAction) {
            $projetTitle = $proposalForm->getProject()?->getTitle();

            $this->actionLogger->logGraphQLMutation(
                $viewer,
                LogActionType::CREATE,
                sprintf('le formulaire de dépôt %s%s', $proposalForm->getTitle(), null === $projetTitle ? '' : sprintf(' du projet %s', $projetTitle)),
                ProposalForm::class,
                $proposalForm->getId()
            );
        }

        return ['proposalForm' => $proposalForm];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(ProposalFormVoter::CREATE, new ProposalForm());
    }
}
