<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\Oauth2SSOConfigurationFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateOauth2SSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
        private readonly Oauth2SSOConfigurationRepository $repository
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        $id = GlobalId::fromGlobalId($values['id'])['id'];

        $ssoConfiguration = $this->repository->find($id);
        unset($values['id']);

        if (!$ssoConfiguration) {
            throw new UserError('Oauth2 configuration not found.');
        }

        $form = $this->formFactory->create(
            Oauth2SSOConfigurationFormType::class,
            $ssoConfiguration
        );
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return compact('ssoConfiguration');
    }
}
