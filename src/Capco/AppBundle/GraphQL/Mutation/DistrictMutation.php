<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalDistrictAdminType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class DistrictMutation implements MutationInterface
{
    private $entityManager;
    private $formFactory;

    public function __construct(
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory
    ) {
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
    }

    public function change(Argument $input): array
    {
        $values = $input->getArrayCopy();

        $district = $this->entityManager->find(
            'CapcoAppBundle:District\ProposalDistrict',
            $values['districtId']
        );
        if (!$district) {
            throw new UserError(sprintf('Unknown district with id "%d"', $values['districtId']));
        }
        unset($values['districtId']); // This only usefull to retrieve the district

        $form = $this->formFactory->create(ProposalDistrictAdminType::class, $district);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid.');
        }

        $this->entityManager->flush();

        return ['district' => $district];
    }
}
