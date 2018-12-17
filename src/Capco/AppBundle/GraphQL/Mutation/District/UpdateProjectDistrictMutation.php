<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Form\ProjectDistrictType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Symfony\Component\Form\FormFactoryInterface;
use Psr\Log\LoggerInterface;

class UpdateProjectDistrictMutation implements MutationInterface
{
    protected $logger;
    protected $em;
    protected $projectDistrictRepository;
    protected $formFactory;

    public function __construct(
        EntityManagerInterface $em,
        ProjectDistrictRepository $projectDistrictRepository,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input): array
    {
        $values = $input->getRawArguments();
        $projectDistrictId = $input->offsetGet('id');

        $projectDistrict = $this->projectDistrictRepository->find($projectDistrictId);

        if (!$projectDistrict) {
            $error = [
                'message' => sprintf('Unknown project district with id: %s', $projectDistrictId),
            ];
            $this->logger->error(
                sprintf('Unknown project district with id: %s', $projectDistrictId)
            );

            return ['district' => null, 'userErrors' => [$error]];
        }

        unset($values['id']);

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
