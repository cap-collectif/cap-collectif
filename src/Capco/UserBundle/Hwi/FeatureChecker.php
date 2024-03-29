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

    private Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository;
    private FacebookSSOConfigurationRepository $facebookSSOConfigurationRepository;
    private Manager $manager;

    public function __construct(
        Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository,
        FacebookSSOConfigurationRepository $facebookSSOConfigurationRepository,
        Manager $manager
    ) {
        $this->oauth2SSOConfigurationRepository = $oauth2SSOConfigurationRepository;
        $this->facebookSSOConfigurationRepository = $facebookSSOConfigurationRepository;
        $this->manager = $manager;
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
