<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\ProjectDistrictType;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class CreateProjectDistrictMutation implements MutationInterface
{
    protected LoggerInterface $logger;
    protected EntityManagerInterface $em;
    protected FormFactoryInterface $formFactory;

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
        $values = $input->getArrayCopy();
        if (isset($values['border']) && !$values['border']['enabled']) {
            unset($values['border']);
        }
        if (isset($values['background']) && !$values['background']['enabled']) {
            unset($values['background']);
        }
        LocaleUtils::indexTranslations($values);

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
