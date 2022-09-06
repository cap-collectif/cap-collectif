<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\QuestionnaireCreateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class CreateQuestionnaireMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private SettableOwnerResolver $settableOwnerResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->settableOwnerResolver = $settableOwnerResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
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
        $form->submit($input->getArrayCopy(), false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($questionnaire);
        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }
}
