<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\PublicDataType;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProfilePublicDataMutation
{
    private $em;
    private $formFactory;
    private $logger;
    private $toggleManager;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, Manager $toggleManager, LoggerInterface $logger)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->toggleManager = $toggleManager;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getRawArguments();

        if (!$this->toggleManager->isActive('user_type')) {
            // blocking bug, need to throw an exception and catch it into JS
            unset($arguments['userType']);
        }

        $form = $this->formFactory->create(PublicDataType::class, $user, ['csrf_protection' => false]);
        try {
            $form->submit($arguments, false);
        } catch (\LogicException $e) {
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));
            throw new UserError('Can\'t update !');
        }

        $this->em->flush();

        return ['viewer' => $user];
    }
}
