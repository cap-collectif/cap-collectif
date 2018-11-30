<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\ProjectDistrictType;
use Symfony\Component\Form\FormFactory;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;

class CreateProjectDistrictMutation implements MutationInterface
{
    protected $logger;
    protected $em;
    protected $formFactory;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        FormFactory $formFactory
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input): array
    {
        $projectDistrict = new ProjectDistrict();
        $values = $input->getRawArguments();

        $form = $this->formFactory->create(ProjectDistrictType::class, $projectDistrict);

        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($projectDistrict);
        $this->em->flush();

        return ['district' => $projectDistrict];
    }
}
