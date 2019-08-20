<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\PublicDataType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProfilePublicDataMutation extends BaseUpdateProfile
{
    private $toggleManager;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        Manager $toggleManager
    ) {
        $this->toggleManager = $toggleManager;
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->user = $user;
        $this->arguments = $input->getArrayCopy();
        if (isset($this->arguments[self::USER_ID])) {
            parent::__invoke($input, $user);
        }

        if (!$this->toggleManager->isActive('user_type')) {
            // blocking bug, need to throw an exception and catch it into JS
            unset($this->arguments['userType']);
        }

        $form = $this->formFactory->create(PublicDataType::class, $this->user);

        try {
            $form->submit($this->arguments, false);
        } catch (\LogicException $e) {
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw new UserError('Can\'t update !');
        }

        $this->em->flush();

        return [self::USER => $this->user];
    }
}
