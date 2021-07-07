<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateSiteParameterMutation implements MutationInterface
{
    public const INVALID_VALUE = 'INVALID_VALUE';

    public const KEYNAME_RECEIVE_ADDRESS = 'admin.mail.notifications.receive_address';
    public const KEYNAME_SEND_NAME = 'admin.mail.notifications.send_name';

    private SiteParameterRepository $repository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        SiteParameterRepository $repository,
        EntityManagerInterface $entityManager
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Argument $input): array
    {
        try {
            self::checkValue($input);
            $siteParameter = $this->getSiteParameter($input);
            self::updateSiteParameter($siteParameter, $input);
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        return $this->repository->findOneByKeyname($input->offsetGet('keyname'));
    }

    private static function updateSiteParameter(SiteParameter $siteParameter, Argument $input): void
    {
        $siteParameter->setValue($input->offsetGet('value'), $input->offsetGet('locale'));
    }

    private static function checkValue(Argument $input): void
    {
        if (self::KEYNAME_RECEIVE_ADDRESS === $input->offsetGet('keyname')) {
            if (!filter_var($input->offsetGet('value'), \FILTER_VALIDATE_EMAIL)) {
                throw new UserError(self::INVALID_VALUE);
            }
        }
    }
}
