<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\DBAL\Enum\SSOType;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class AllRequirementsResolver implements QueryInterface
{
    private ConnectionBuilder $builder;
    private Manager $manager;
    private AbstractSSOConfigurationRepository $abstractSSOConfigurationRepository;
    private TokenGenerator $tokenGenerator;

    public function __construct(
        ConnectionBuilder $builder,
        Manager $manager,
        AbstractSSOConfigurationRepository $abstractSSOConfigurationRepository,
        TokenGenerator $tokenGenerator
    ) {
        $this->builder = $builder;
        $this->manager = $manager;
        $this->abstractSSOConfigurationRepository = $abstractSSOConfigurationRepository;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function __invoke(
        AbstractStep $step,
        Argument $args
    ): ConnectionInterface {
        $requirements = $this->getAllRequirements($step);

        /** * @var Requirement[] $requirements  */
        $requirements = array_filter($requirements, function ($requirement) use ($step) {
            if (Requirement::PHONE_VERIFIED === $requirement->getType()) {
                return $this->isPhoneVerfiedAllowed($step);
            }

            if (Requirement::FRANCE_CONNECT === $requirement->getType()) {
                return $this->isFranceConnectAllowed();
            }

            return true;
        });

        $connection = $this->builder->connectionFromArray($requirements, $args);
        $connection->{'viewerMeetsTheRequirements'} = false;
        $connection->setTotalCount(\count($requirements));

        return $connection;
    }

    private function isPhoneVerfiedAllowed(AbstractStep $step): bool
    {
        $isProposalStep = $step instanceof CollectStep || $step instanceof SelectionStep;
        $twilioEnabled = $this->manager->isActive(Manager::twilio);

        if (!$isProposalStep) {
            return false;
        }

        if (!$twilioEnabled) {
            return false;
        }

        return true;
    }

    private function isFranceConnectAllowed(): bool
    {
        $featureEnabled = $this->manager->isActive(Manager::login_franceconnect);
        $sso = $this->abstractSSOConfigurationRepository->findOneByType(SSOType::FRANCE_CONNECT, true);

        if (false === $sso instanceof FranceConnectSSOConfiguration) {
            return false;
        }

        if (!$featureEnabled) {
            return false;
        }

        return $sso->isCompletelyConfigured();
    }

    private function getAllRequirements(AbstractStep $step): array
    {
        $types = array_filter(Requirement::$types, function ($type) {
            if (Requirement::CHECKBOX === $type) {
                return false;
            }

            return true;
        });

        $requirements = [];
        foreach ($types as $type) {
            // we generate a fake id since relay is always querying an id even if you don't specify it in the query it avoids globalId conflicts
            $requirements[] = (new Requirement())
                ->setStep($step)
                ->setType($type)
                ->setId($this->tokenGenerator->generateToken())
            ;
        }

        return $requirements;
    }
}
