<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Form\GlobalDistrictType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateGlobalDistrictMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        protected EntityManagerInterface $em,
        protected FormFactoryInterface $formFactory,
        protected LoggerInterface $logger,
        protected GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(Argument $input, $viewer): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        $globalDistrict = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);

        if (!$globalDistrict instanceof GlobalDistrict) {
            $error = [
                'message' => sprintf('Unknown project district with id: %s', $input->offsetGet('id')),
            ];
            $this->logger->error(
                sprintf('Unknown project district with id: %s', $input->offsetGet('id'))
            );

            return ['district' => null, 'userErrors' => [$error]];
        }

        unset($values['id']);
        LocaleUtils::indexTranslations($values);

        $form = $this->formFactory->create(GlobalDistrictType::class, $globalDistrict);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $error = ['message' => 'Error during form validation.'];
            $this->logger->error('Error during form validation.');

            return ['district' => null, 'userErrors' => [$error]];
        }

        $this->em->flush();

        return ['district' => $globalDistrict, 'userErrors' => []];
    }
}
