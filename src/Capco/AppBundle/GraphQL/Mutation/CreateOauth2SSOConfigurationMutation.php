<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Form\Oauth2SSOConfigurationFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class CreateOauth2SSOConfigurationMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $values = $input->getRawArguments();
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
