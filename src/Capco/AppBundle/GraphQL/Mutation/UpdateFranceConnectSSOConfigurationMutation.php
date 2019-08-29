<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\FranceConnectSSOConfigurationFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateFranceConnectSSOConfigurationMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $repository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        FranceConnectSSOConfigurationRepository $repository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $values = $input->getArrayCopy();

        $fcConfiguration = $this->repository->findOneBy(['enabled' => true]);

        if (!$fcConfiguration) {
            throw new UserError('France Connect configuration is not activated.');
        }

        $form = $this->formFactory->create(
            FranceConnectSSOConfigurationFormType::class,
            $fcConfiguration
        );
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return compact('fcConfiguration');
    }
}
