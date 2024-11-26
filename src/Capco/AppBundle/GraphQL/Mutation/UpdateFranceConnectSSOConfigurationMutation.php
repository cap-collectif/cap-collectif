<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\SSOType;
use Capco\AppBundle\Form\FranceConnectSSOConfigurationFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateFranceConnectSSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly FormFactoryInterface $formFactory;
    private readonly AbstractSSOConfigurationRepository $repository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AbstractSSOConfigurationRepository $repository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        $fcConfiguration = $this->repository->findASsoByType(SSOType::FRANCE_CONNECT);

        if (!$fcConfiguration) {
            throw new UserError('France Connect configuration is not activated.');
        }

        $form = $this->formFactory->create(
            FranceConnectSSOConfigurationFormType::class,
            $fcConfiguration
        );
        $values['allowedData'] = [
            'given_name' => $values['given_name'],
            'family_name' => $values['family_name'],
            'birthdate' => $values['birthdate'],
            'gender' => $values['gender'],
            'birthplace' => $values['birthplace'],
            'birthcountry' => $values['birthcountry'],
            'email' => $values['email'],
            'preferred_username' => $values['preferred_username'],
        ];
        unset(
            $values['given_name'],
            $values['family_name'],
            $values['birthdate'],
            $values['gender'],
            $values['birthcountry'],
            $values['email'],
            $values['preferred_username'],
            $values['birthplace']
        );
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return compact('fcConfiguration');
    }
}
