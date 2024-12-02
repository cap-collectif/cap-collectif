<?php

declare(strict_types=1);

namespace Capco\UserBundle\Hwi;

use Capco\AppBundle\Repository\FacebookSSOConfigurationRepository;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;

class FeatureChecker
{
    private const FEATURE_PREFIX = 'login_';
    private array $errors = [];

    public function __construct(private readonly Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository, private readonly FacebookSSOConfigurationRepository $facebookSSOConfigurationRepository, private readonly Manager $manager)
    {
    }

    public function isServiceEnabled(string $service): bool
    {
        if ('openid' === $service && $this->manager->isActive('login_openid')) {
            return (bool) $this->oauth2SSOConfigurationRepository->findOneBy(['enabled' => true]);
        }

        if ('facebook' === $service && $this->manager->isActive('login_facebook')) {
            return (bool) $this->facebookSSOConfigurationRepository->findOneBy(['enabled' => true]);
        }

        if (!$this->manager->isActive(self::FEATURE_PREFIX . $service)) {
            $this->errors[] = 'Service ' . $service . ' is not enabled';

            return false;
        }

        return true;
    }
}
