<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Form\ProjectDistrictType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProjectDistrictMutation implements MutationInterface
{
    use MutationTrait;

    protected LoggerInterface $logger;
    protected EntityManagerInterface $em;
    protected FormFactoryInterface $formFactory;
    protected GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, $viewer): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        $projectDistrict = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);

        if (!$projectDistrict instanceof ProjectDistrict) {
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

        $form = $this->formFactory->create(ProjectDistrictType::class, $projectDistrict);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $error = ['message' => 'Error during form validation.'];
            $this->logger->error('Error during form validation.');

            return ['district' => null, 'userErrors' => [$error]];
        }

        $this->em->flush();

        return ['district' => $projectDistrict, 'userErrors' => []];
    }
}
