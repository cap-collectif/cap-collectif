<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\PersonalDataFormType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateProfilePersonalDataMutation extends BaseUpdateProfile
{
    public function __invoke(Argument $input, User $user): array
    {
        parent::__invoke($input, $user);

        $form = $this->formFactory->create(PersonalDataFormType::class, $this->user, ['csrf_protection' => false]);
        try {
            $form->submit($this->arguments, false);
        } catch (\LogicException $e) {
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));
            throw new UserError('Can\'t update !');
        }

        $this->em->flush();

        return [self::USER => $this->user];
    }
}
