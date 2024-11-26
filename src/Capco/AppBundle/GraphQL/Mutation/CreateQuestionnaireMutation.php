<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\QuestionnaireCreateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateQuestionnaireMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly FormFactoryInterface $formFactory;
    private readonly LoggerInterface $logger;
    private readonly SettableOwnerResolver $settableOwnerResolver;
    private readonly AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        SettableOwnerResolver $settableOwnerResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->settableOwnerResolver = $settableOwnerResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $questionnaire = new Questionnaire();
        $questionnaire->setCreator($viewer);
        $questionnaire->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );
        $questionnaire->setDescriptionUsingJoditWysiwyg(true);

        $form = $this->formFactory->create(QuestionnaireCreateType::class, $questionnaire);

        $data = $input->getArrayCopy();
        if (isset($data['owner'])) {
            unset($data['owner']);
        }
        $form->submit($data, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($questionnaire);
        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }

    public function isGranted(?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        return $this->authorizationChecker->isGranted(
            QuestionnaireVoter::CREATE,
            new Questionnaire()
        );
    }
}
