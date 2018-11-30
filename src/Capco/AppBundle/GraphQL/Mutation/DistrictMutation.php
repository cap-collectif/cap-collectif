<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalDistrictAdminType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class DistrictMutation implements ContainerAwareInterface, MutationInterface
{
    use ContainerAwareTrait;

    public function change(Argument $input): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();

        $district = $em->find('CapcoAppBundle:District\ProposalDistrict', $values['districtId']);
        if (!$district) {
            throw new UserError(sprintf('Unknown district with id "%d"', $values['districtId']));
        }
        unset($values['districtId']); // This only usefull to retrieve the district

        $form = $formFactory->create(ProposalDistrictAdminType::class, $district);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid.');
        }

        $em->flush();

        return ['district' => $district];
    }
}
