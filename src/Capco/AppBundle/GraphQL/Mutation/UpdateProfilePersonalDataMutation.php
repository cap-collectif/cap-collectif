<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
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
    use MutationTrait;

    final public const CANT_UPDATE = 'CANT_UPDATE';

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
        $this->formatInput($input);
        $this->user = $viewer;
        $this->arguments = $input->getArrayCopy();

        $stepId = $input->offsetGet('stepId');
        unset($this->arguments['stepId']);

        $isUpdatingFromBO = isset($this->arguments[self::USER_ID]);
        if ($isUpdatingFromBO) {
            parent::__invoke($input, $viewer);
        }

        $oldPhone = $viewer->getPhone();
        $newPhone = $this->arguments['phone'] ?? null;

        $hasUpdatedPhoneWithEmptyValue = \array_key_exists('phone', $this->arguments) && null === $this->arguments['phone'];
        $hasUpdatedWithNewPhone = $newPhone && $oldPhone !== $newPhone;
        if (
            $hasUpdatedPhoneWithEmptyValue
            || $hasUpdatedWithNewPhone
        ) {
            $viewer->setPhoneConfirmed(false);
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
                $message = $error->getMessageTemplate();
                if (UserPhoneErrors::PHONE_INVALID_LENGTH === $message) {
                    return [
                        'user' => $this->user,
                        'errorCode' => UserPhoneErrors::PHONE_INVALID_LENGTH,
                    ];
                }
                if (CheckIdentificationCode::BAD_CODE === $message) {
                    return [
                        'user' => $this->user,
                        'errorCode' => CheckIdentificationCode::BAD_CODE,
                    ];
                }
                if (CheckIdentificationCode::CODE_ALREADY_USED === $message) {
                    return [
                        'user' => $this->user,
                        'errorCode' => CheckIdentificationCode::CODE_ALREADY_USED,
                    ];
                }
            }

            return [
                'user' => $this->user,
                'errorCode' => self::CANT_UPDATE,
            ];
        }

        try {
            $this->em->flush();
        } catch (\Exception) {
            throw new UserError();
        }

        return [self::USER => $this->user, 'errorCode' => null];
    }
}
