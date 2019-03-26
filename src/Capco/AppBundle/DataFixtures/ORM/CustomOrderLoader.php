<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\ORM;

use Fidry\AliceDataFixtures\LoaderInterface;
use Fidry\AliceDataFixtures\Persistence\PurgeMode;
use Nelmio\Alice\IsAServiceTrait;

/**
 * @final
 */
/*final*/ class CustomOrderLoader implements LoaderInterface
{
    use IsAServiceTrait;

    private $decoratedLoader;

    public function __construct(LoaderInterface $decoratedLoader)
    {
        $this->decoratedLoader = $decoratedLoader;
    }

    /**
     * Pre process, persist and post process each object loaded.
     *
     * {@inheritdoc}
     */
    public function load(
        array $fixturesFiles,
        array $parameters = [],
        array $objects = [],
        PurgeMode $purgeMode = null
    ): array {
        // We get the objects from the decorated loader
        $objects = $this->decoratedLoader->load($fixturesFiles, $parameters, $objects, $purgeMode);

        return array_reverse($objects, true);
    }
}
