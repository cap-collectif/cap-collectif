<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\Oauth2SSOConfigurationFormType;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class UpdateOauth2SSOConfigurationMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;
    private $repository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        Oauth2SSOConfigurationRepository $repository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $values = $input->getRawArguments();
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
            $this->handleErrors($form);
        }

        $this->em->flush();

        return compact('ssoConfiguration');
    }

    private function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error((string) $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }
}
