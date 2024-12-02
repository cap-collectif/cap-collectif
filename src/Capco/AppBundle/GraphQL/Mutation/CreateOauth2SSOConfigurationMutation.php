<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Form\Oauth2SSOConfigurationFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class CreateOauth2SSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        $ssoConfiguration = new Oauth2SSOConfiguration();

        $form = $this->formFactory->create(
            Oauth2SSOConfigurationFormType::class,
            $ssoConfiguration
        );
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($ssoConfiguration);
        $this->em->flush();

        return compact('ssoConfiguration');
    }
}
