<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\ProjectDistrictType;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class CreateProjectDistrictMutation implements MutationInterface
{
    protected $logger;
    protected $em;
    protected $formFactory;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input): array
    {
        $projectDistrict = new ProjectDistrict();
        $values = $input->getRawArguments();
        if (!$values['border']['enabled']) {
            unset($values['border']);
        }
        if (!$values['background']['enabled']) {
            unset($values['background']);
        }

        $form = $this->formFactory->create(ProjectDistrictType::class, $projectDistrict);

        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($projectDistrict);
        $this->em->flush();

        $totalCount = 0;
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $projectDistrict);

        return ['district' => $projectDistrict, 'districtEdge' => $edge, 'userErrors' => []];
    }
}
