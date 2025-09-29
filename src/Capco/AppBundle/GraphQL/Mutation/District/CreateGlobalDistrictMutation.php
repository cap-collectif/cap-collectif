<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Form\GlobalDistrictType;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class CreateGlobalDistrictMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        protected LoggerInterface $logger,
        protected EntityManagerInterface $em,
        protected FormFactoryInterface $formFactory
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $globalDistrict = new GlobalDistrict();
        $values = $input->getArrayCopy();
        if (isset($values['border']) && !$values['border']['enabled']) {
            unset($values['border']);
        }
        if (isset($values['background']) && !$values['background']['enabled']) {
            unset($values['background']);
        }
        LocaleUtils::indexTranslations($values);

        $form = $this->formFactory->create(GlobalDistrictType::class, $globalDistrict);

        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($globalDistrict);
        $this->em->flush();

        $totalCount = 0;
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $globalDistrict);

        return ['district' => $globalDistrict, 'districtEdge' => $edge, 'userErrors' => []];
    }
}
