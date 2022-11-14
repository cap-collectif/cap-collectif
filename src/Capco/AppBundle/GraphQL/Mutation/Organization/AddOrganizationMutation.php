<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Form\OrganizationType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class AddOrganizationMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;

    public function __construct(EntityManagerInterface $em, FormFactoryInterface $formFactory)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Arg $input): array
    {
        $data = $input->getArrayCopy();
        LocaleUtils::indexTranslations($data);

        $organization = new Organization();
        $organization->mergeNewTranslations();

        $form = $this->formFactory->create(OrganizationType::class, $organization);
        $form->submit($data, false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($organization);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return ['organization' => $organization];
    }
}
