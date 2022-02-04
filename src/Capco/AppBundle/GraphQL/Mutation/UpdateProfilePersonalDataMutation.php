<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\PersonalDataFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProfilePersonalDataMutation extends BaseUpdateProfile
{
    public const CANT_UPDATE = 'CANT_UPDATE';

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository
    ) {
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->user = $viewer;
        $this->arguments = $input->getArrayCopy();

        $isUpdatingFromBO = isset($this->arguments[self::USER_ID]);
        if ($isUpdatingFromBO) {
            parent::__invoke($input, $viewer);
        }

        $form = $this->formFactory->create(PersonalDataFormType::class, $this->user);

        try {
            $form->submit($this->arguments, false);
        } catch (\LogicException $e) {
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
        }

        if (!$form->isValid()) {
            $errors = $form->getErrors(true, true);
            foreach ($errors as $error) {
                $message = $error->getMessage();
                if ($message === UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER) {
                    return ['user' => $this->user, 'errorCode' => UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER];
                }
                if ($message === UserPhoneErrors::PHONE_ALREADY_USED_BY_ANOTHER_USER) {
                    return ['user' => $this->user, 'errorCode' => UserPhoneErrors::PHONE_ALREADY_USED_BY_ANOTHER_USER];
                }
                if ($message === UserPhoneErrors::PHONE_INVALID_LENGTH) {
                    return ['user' => $this->user, 'errorCode' => UserPhoneErrors::PHONE_INVALID_LENGTH];
                }
            }
            return [
                'user' => $this->user,
                'errorCode' => self::CANT_UPDATE,
            ];
        }

        try {
            $this->em->flush();
        } catch (\Exception $exception) {
            throw new UserError();
        }

        return [self::USER => $this->user, 'errorCode' => null];
    }
}
