<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Form\ProposalDistrictAdminType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class DistrictMutation implements MutationInterface
{
    private EntityManagerInterface $entityManager;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, $viewer): array
    {
        $values = $input->getArrayCopy();
        $district = $this->globalIdResolver->resolve($values['districtId'], $viewer);

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
